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

      const evt = await botSeat.getEvent(1);
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
  });

  describe("Seat Reservation & Double Booking Prevention", function () {
    beforeEach(async function () {
      const eventTime = Math.floor(Date.now() / 1000) + 86400 * 10;
      await botSeat.connect(organizer).createEvent(
        "DevFest Ogbomoso 2026",
        "DevFest celebration",
        "LAUTECH Hall",
        eventTime,
        50,
        ""
      );
    });

    it("Should allow an attendee to reserve an available seat (A24)", async function () {
      const tx = await botSeat.connect(attendee1).reserveSeat(1, "A24");
      const receipt = await tx.wait();

      // Check seat availability
      const isAvailable = await botSeat.checkSeatAvailability(1, "A24");
      expect(isAvailable).to.be.false;

      // Check event reserved count
      const evt = await botSeat.getEvent(1);
      expect(evt.reservedCount).to.equal(1n);

      // Check user reservations
      const userRes = await botSeat.getUserReservations(attendee1.address);
      expect(userRes.length).to.equal(1);
      expect(userRes[0].seatId).to.equal("A24");
      expect(userRes[0].attendee).to.equal(attendee1.address);
    });

    it("CRITICAL: Must reject double booking if second attendee tries to reserve A24", async function () {
      // First attendee reserves A24
      await botSeat.connect(attendee1).reserveSeat(1, "A24");

      // Second attendee tries to reserve A24 -> MUST REVERT
      await expect(
        botSeat.connect(attendee2).reserveSeat(1, "A24")
      ).to.be.revertedWithCustomError(botSeat, "SeatAlreadyReserved");
    });

    it("Should allow reserving different seats concurrently without conflict", async function () {
      await botSeat.connect(attendee1).reserveSeat(1, "A01");
      await botSeat.connect(attendee2).reserveSeat(1, "B05");

      const reservedSeats = await botSeat.getReservedSeats(1);
      expect(reservedSeats).to.deep.equal(["A01", "B05"]);
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

      const tx = await botSeat.connect(attendee1).reserveSeat(1, "A24");
      const receipt = await tx.wait();
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

  describe("Cancellation & Seat Release", function () {
    it("Should allow attendee to cancel reservation and make seat available again", async function () {
      const eventTime = Math.floor(Date.now() / 1000) + 86400 * 5;
      await botSeat.connect(organizer).createEvent("Conference", "Desc", "Venue", eventTime, 20, "");
      
      await botSeat.connect(attendee1).reserveSeat(1, "C12");
      expect(await botSeat.checkSeatAvailability(1, "C12")).to.be.false;

      // Cancel
      await botSeat.connect(attendee1).cancelReservation(1);

      // Seat should be available again
      expect(await botSeat.checkSeatAvailability(1, "C12")).to.be.true;

      // Attendee 2 can now reserve C12
      await expect(botSeat.connect(attendee2).reserveSeat(1, "C12")).to.not.be.reverted;
    });
  });
});
