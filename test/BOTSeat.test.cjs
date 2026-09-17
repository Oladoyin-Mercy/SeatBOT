const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BOTSeat Smart Contract", function () {
  let botSeat;
  let owner, organizer, attendee1, attendee2;

  beforeEach(async function () {
    [owner, organizer, attendee1, attendee2] = await ethers.getSigners();

    const BOTSeat = await ethers.getContractFactory("BOTSeat");
    botSeat = await BOTSeat.deploy();
    await botSeat.waitForDeployment();
  });

  describe("Event Creation", function () {
    it("Should allow an organizer to create an event on-chain", async function () {
      const now = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days later
      const tx = await botSeat.connect(organizer).createEvent(
        "DevFest Ogbomoso 2026",
        "The premier developer and builder gathering in Ogbomoso.",
        "Ladoke Akintola University of Technology (LAUTECH) Hall, Ogbomoso",
        now,
        100,
        JSON.stringify({ image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87" })
      );
      await tx.wait();

      const evt = await botSeat.getFunction("getEvent")(1);
      expect(evt.id).to.equal(1n);
      expect(evt.name).to.equal("DevFest Ogbomoso 2026");
      expect(evt.organizer).to.equal(organizer.address);
      expect(evt.totalSeats).to.equal(100n);
      expect(evt.reservedCount).to.equal(0n);
      expect(evt.isActive).to.be.true;
    });

    it("Should reject creating an event with 0 seats", async function () {
      const now = Math.floor(Date.now() / 1000) + 86400;
      await expect(
        botSeat.connect(organizer).createEvent("Empty Event", "Desc", "Venue", now, 0, "")
      ).to.be.revertedWithCustomError(botSeat, "InvalidSeatCount");
    });

    it("Should reject creating an event with an empty name", async function () {
      const now = Math.floor(Date.now() / 1000) + 86400;
      await expect(
        botSeat.connect(organizer).createEvent("", "Desc", "Venue", now, 50, "")
      ).to.be.revertedWithCustomError(botSeat, "EmptyEventName");
    });
  });

  describe("Seat Validation & Bounds Checking", function () {
    beforeEach(async function () {
      const eventTime = Math.floor(Date.now() / 1000) + 86400 * 10;
      await botSeat.connect(organizer).createEvent(
        "Tech Summit 2026",
        "Summit description",
        "Main Auditorium",
        eventTime,
        50, // totalSeats = 50
        ""
      );
    });

    it("Should allow reserving valid formatted seats within capacity (e.g., A01, A24, A50)", async function () {
      await expect(botSeat.connect(attendee1).reserveSeat(1, "A01")).to.not.be.reverted;
      await expect(botSeat.connect(attendee2).reserveSeat(1, "A24")).to.not.be.reverted;
      await expect(botSeat.connect(owner).reserveSeat(1, "A50")).to.not.be.reverted;
    });

    it("Should REJECT arbitrary nonexistent seats such as A999 exceeding totalSeats (50)", async function () {
      await expect(
        botSeat.connect(attendee1).reserveSeat(1, "A999")
      ).to.be.revertedWithCustomError(botSeat, "SeatOutOfBounds");
    });

    it("Should REJECT seat numbers higher than event totalSeats (e.g. A51 for a 50-seat event)", async function () {
      await expect(
        botSeat.connect(attendee1).reserveSeat(1, "A51")
      ).to.be.revertedWithCustomError(botSeat, "SeatOutOfBounds");
    });

    it("Should REJECT invalid seat formats (e.g. A00, letter-only 'A', special chars)", async function () {
      // Zero seat number
      await expect(
        botSeat.connect(attendee1).reserveSeat(1, "A00")
      ).to.be.revertedWithCustomError(botSeat, "SeatOutOfBounds");

      // Letter only without seat number
      await expect(
        botSeat.connect(attendee1).reserveSeat(1, "A")
      ).to.be.revertedWithCustomError(botSeat, "InvalidSeatId");

      // Non-alphanumeric special characters
      await expect(
        botSeat.connect(attendee1).reserveSeat(1, "A@2")
      ).to.be.revertedWithCustomError(botSeat, "InvalidSeatId");

      // Empty string
      await expect(
        botSeat.connect(attendee1).reserveSeat(1, "")
      ).to.be.revertedWithCustomError(botSeat, "InvalidSeatId");
    });
  });

  describe("Duplicate Seat Rejection & Concurrency", function () {
    beforeEach(async function () {
      const eventTime = Math.floor(Date.now() / 1000) + 86400 * 10;
      await botSeat.connect(organizer).createEvent(
        "Web3 Developer Conference",
        "Blockchain Conference",
        "LAUTECH ICT Hall",
        eventTime,
        50,
        ""
      );
    });

    it("CRITICAL: Must reject double booking if second attendee tries to reserve the same seat (A24)", async function () {
      // First attendee reserves A24
      await botSeat.connect(attendee1).reserveSeat(1, "A24");

      // Second attendee tries to reserve A24 -> MUST REVERT with SeatAlreadyReserved
      await expect(
        botSeat.connect(attendee2).reserveSeat(1, "A24")
      ).to.be.revertedWithCustomError(botSeat, "SeatAlreadyReserved");
    });

    it("Should allow reserving different seats concurrently without conflict", async function () {
      await botSeat.connect(attendee1).reserveSeat(1, "A01");
      await botSeat.connect(attendee2).reserveSeat(1, "B05");

      const reservedSeats = await botSeat.getReservedSeats(1);
      expect(reservedSeats).to.deep.equal(["A01", "B05"]);
      expect(reservedSeats.length).to.equal(2);
    });
  });

  describe("Cancellation & Stale Reserved Seat Cleanup", function () {
    beforeEach(async function () {
      const eventTime = Math.floor(Date.now() / 1000) + 86400 * 5;
      await botSeat.connect(organizer).createEvent(
        "Bohr Hackathon 2026",
        "Hackathon",
        "Hall A",
        eventTime,
        50,
        ""
      );
      // Reserve seats A10 and B20
      await botSeat.connect(attendee1).reserveSeat(1, "A10");
      await botSeat.connect(attendee2).reserveSeat(1, "B20");
    });

    it("Should properly clean up reserved seats list when a reservation is cancelled", async function () {
      // Initial reserved list has both A10 and B20
      let reservedList = await botSeat.getReservedSeats(1);
      expect(reservedList).to.deep.equal(["A10", "B20"]);

      // Cancel reservation 1 (attendee1's A10 seat)
      await botSeat.connect(attendee1).cancelReservation(1);

      // 1. checkSeatAvailability must return true for A10
      expect(await botSeat.checkSeatAvailability(1, "A10")).to.be.true;

      // 2. getReservedSeats must NOT contain A10 (no stale seat data)
      reservedList = await botSeat.getReservedSeats(1);
      expect(reservedList).to.not.include("A10");
      expect(reservedList).to.deep.equal(["B20"]);
      expect(reservedList.length).to.equal(1);

      // 3. Event reservedCount must be 1
      const evt = await botSeat.getFunction("getEvent")(1);
      expect(evt.reservedCount).to.equal(1n);

      // 4. verifyReservation for reservation 1 must return isValid = false
      const [isValid] = await botSeat.verifyReservation(1);
      expect(isValid).to.be.false;

      // 5. Another attendee can now reserve the released seat A10
      await expect(botSeat.connect(attendee2).reserveSeat(1, "A10")).to.not.be.reverted;

      // Seat A10 is back in reserved list
      const updatedList = await botSeat.getReservedSeats(1);
      expect(updatedList).to.include("A10");
      expect(updatedList).to.include("B20");
    });

    it("Should reject unauthorized cancellation attempts", async function () {
      // attendee2 tries to cancel attendee1's reservation (id 1)
      await expect(
        botSeat.connect(attendee2).cancelReservation(1)
      ).to.be.revertedWithCustomError(botSeat, "Unauthorized");
    });
  });

  describe("On-Chain Verification", function () {
    let reservationId;

    beforeEach(async function () {
      const eventTime = Math.floor(Date.now() / 1000) + 86400 * 5;
      await botSeat.connect(organizer).createEvent(
        "DevFest Ogbomoso 2026",
        "Tech summit",
        "LAUTECH Main Hall",
        eventTime,
        100,
        ""
      );

      await botSeat.connect(attendee1).reserveSeat(1, "A24");
      reservationId = 1;
    });

    it("Should verify a valid reservation on-chain without wallet connection", async function () {
      const [isValid, res, evt] = await botSeat.verifyReservation(reservationId);
      expect(isValid).to.be.true;
      expect(res.seatId).to.equal("A24");
      expect(res.attendee).to.equal(attendee1.address);
      expect(evt.name).to.equal("DevFest Ogbomoso 2026");
    });

    it("Should return invalid for nonexistent reservation ID", async function () {
      const [isValid] = await botSeat.verifyReservation(9999);
      expect(isValid).to.be.false;
    });
  });

  describe("Network & Chain ID Configuration Safeguards", function () {
    it("Should confirm BOT Chain Mainnet hardhat network configuration (Chain ID 677, RPC https://rpc.botchain.ai)", function () {
      const hre = require("hardhat");
      const mainnetConfig = hre.config.networks.botchainMainnet;
      expect(mainnetConfig).to.not.be.undefined;
      expect(mainnetConfig.chainId).to.equal(677);
      expect(mainnetConfig.url).to.equal("https://rpc.botchain.ai");
    });
  });
});
