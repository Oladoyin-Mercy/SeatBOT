// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BOTSeat
 * @dev Blockchain-powered event seat reservation smart contract on BOT Chain.
 * Prevents double-booking, records verifiable seat reservations, and generates ticket proofs.
 */
contract BOTSeat {
    struct Event {
        uint256 id;
        string name;
        string description;
        string venue;
        uint256 dateTimestamp;
        uint256 totalSeats;
        uint256 reservedCount;
        address organizer;
        string metadataURI; // e.g. JSON metadata containing banner image, layout format, etc.
        bool isActive;
    }

    struct Reservation {
        uint256 reservationId;
        uint256 eventId;
        string seatId; // e.g. "A01", "B24"
        address attendee;
        uint256 reservedAt;
        bool isCancelled;
    }

    // Storage
    uint256 private _eventIdCounter;
    uint256 private _reservationIdCounter;

    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(string => bool)) public isSeatReserved;
    mapping(uint256 => mapping(string => uint256)) public seatToReservationId;
    mapping(uint256 => Reservation) public reservations;
    mapping(address => uint256[]) private _userReservations;
    mapping(uint256 => uint256[]) private _eventReservations;
    mapping(uint256 => string[]) private _eventReservedSeats;
    uint256[] private _allEventIds;

    // Custom Errors
    error EventNotFound();
    error EventInactive();
    error SeatAlreadyReserved(string seatId);
    error InvalidSeatId();
    error ReservationNotFound();
    error Unauthorized();
    error ReservationAlreadyCancelled();
    error EmptyEventName();
    error InvalidSeatCount();

    // Events
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        string name,
        string venue,
        uint256 dateTimestamp,
        uint256 totalSeats,
        string metadataURI
    );

    event SeatReserved(
        uint256 indexed reservationId,
        uint256 indexed eventId,
        string seatId,
        address indexed attendee,
        uint256 timestamp
    );

    event ReservationCancelled(
        uint256 indexed reservationId,
        uint256 indexed eventId,
        string seatId,
        address indexed attendee
    );

    constructor() {
        // Initialize with standard starting IDs
        _eventIdCounter = 1;
        _reservationIdCounter = 1;
    }

    /**
     * @notice Create a new event with seat configuration
     * @param name Name of the event
     * @param description Brief description of the event
     * @param venue Location or venue address
     * @param dateTimestamp Epoch timestamp for the event
     * @param totalSeats Total seating capacity
     * @param metadataURI IPFS or URL metadata containing rich data like banner image
     */
    function createEvent(
        string memory name,
        string memory description,
        string memory venue,
        uint256 dateTimestamp,
        uint256 totalSeats,
        string memory metadataURI
    ) external returns (uint256) {
        if (bytes(name).length == 0) revert EmptyEventName();
        if (totalSeats == 0) revert InvalidSeatCount();

        uint256 newEventId = _eventIdCounter++;

        events[newEventId] = Event({
            id: newEventId,
            name: name,
            description: description,
            venue: venue,
            dateTimestamp: dateTimestamp,
            totalSeats: totalSeats,
            reservedCount: 0,
            organizer: msg.sender,
            metadataURI: metadataURI,
            isActive: true
        });

        _allEventIds.push(newEventId);

        emit EventCreated(
            newEventId,
            msg.sender,
            name,
            venue,
            dateTimestamp,
            totalSeats,
            metadataURI
        );

        return newEventId;
    }

    /**
     * @notice Reserve a specific seat for an event
     * @param eventId The ID of the event
     * @param seatId The seat code (e.g. "A24", "B03")
     */
    function reserveSeat(
        uint256 eventId,
        string memory seatId
    ) external payable returns (uint256) {
        Event storage evt = events[eventId];
        if (evt.id == 0) revert EventNotFound();
        if (!evt.isActive) revert EventInactive();
        if (bytes(seatId).length == 0) revert InvalidSeatId();
        if (isSeatReserved[eventId][seatId]) revert SeatAlreadyReserved(seatId);

        uint256 newReservationId = _reservationIdCounter++;

        // Mark seat as reserved
        isSeatReserved[eventId][seatId] = true;
        seatToReservationId[eventId][seatId] = newReservationId;

        // Record reservation
        reservations[newReservationId] = Reservation({
            reservationId: newReservationId,
            eventId: eventId,
            seatId: seatId,
            attendee: msg.sender,
            reservedAt: block.timestamp,
            isCancelled: false
        });

        evt.reservedCount++;

        _userReservations[msg.sender].push(newReservationId);
        _eventReservations[eventId].push(newReservationId);
        _eventReservedSeats[eventId].push(seatId);

        emit SeatReserved(
            newReservationId,
            eventId,
            seatId,
            msg.sender,
            block.timestamp
        );

        return newReservationId;
    }

    /**
     * @notice Cancel a reservation (can only be executed by attendee or event organizer)
     * @param reservationId The unique reservation ID
     */
    function cancelReservation(uint256 reservationId) external {
        Reservation storage res = reservations[reservationId];
        if (res.reservationId == 0) revert ReservationNotFound();
        if (res.isCancelled) revert ReservationAlreadyCancelled();

        Event storage evt = events[res.eventId];
        if (msg.sender != res.attendee && msg.sender != evt.organizer) {
            revert Unauthorized();
        }

        res.isCancelled = true;
        isSeatReserved[res.eventId][res.seatId] = false;
        seatToReservationId[res.eventId][res.seatId] = 0;
        
        if (evt.reservedCount > 0) {
            evt.reservedCount--;
        }

        emit ReservationCancelled(
            reservationId,
            res.eventId,
            res.seatId,
            res.attendee
        );
    }

    /**
     * @notice Check if a seat is reserved
     */
    function checkSeatAvailability(
        uint256 eventId,
        string memory seatId
    ) external view returns (bool isAvailable) {
        if (events[eventId].id == 0) return false;
        return !isSeatReserved[eventId][seatId];
    }

    /**
     * @notice Get all reserved seat IDs for an event
     */
    function getReservedSeats(
        uint256 eventId
    ) external view returns (string[] memory) {
        return _eventReservedSeats[eventId];
    }

    /**
     * @notice Verify a reservation status on-chain
     * @param reservationId The reservation ID
     * @return isValid True if the reservation is valid and not cancelled
     * @return res The Reservation data struct
     * @return evt The Event data struct
     */
    function verifyReservation(
        uint256 reservationId
    ) external view returns (
        bool isValid,
        Reservation memory res,
        Event memory evt
    ) {
        res = reservations[reservationId];
        if (res.reservationId == 0 || res.isCancelled) {
            return (false, res, evt);
        }

        evt = events[res.eventId];
        if (evt.id == 0 || !evt.isActive) {
            return (false, res, evt);
        }

        return (true, res, evt);
    }

    /**
     * @notice Get all reservations made by a user
     */
    function getUserReservations(
        address user
    ) external view returns (Reservation[] memory) {
        uint256[] memory ids = _userReservations[user];
        Reservation[] memory userResList = new Reservation[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            userResList[i] = reservations[ids[i]];
        }

        return userResList;
    }

    /**
     * @notice Get all reservations for an event
     */
    function getEventReservations(
        uint256 eventId
    ) external view returns (Reservation[] memory) {
        uint256[] memory ids = _eventReservations[eventId];
        Reservation[] memory eventResList = new Reservation[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            eventResList[i] = reservations[ids[i]];
        }

        return eventResList;
    }

    /**
     * @notice Get total event count
     */
    function getEventsCount() external view returns (uint256) {
        return _allEventIds.length;
    }

    /**
     * @notice Get all active events
     */
    function getAllEvents() external view returns (Event[] memory) {
        Event[] memory allEvts = new Event[](_allEventIds.length);
        for (uint256 i = 0; i < _allEventIds.length; i++) {
            allEvts[i] = events[_allEventIds[i]];
        }
        return allEvts;
    }

    /**
     * @notice Get details for a single event
     */
    function getEvent(uint256 eventId) external view returns (Event memory) {
        if (events[eventId].id == 0) revert EventNotFound();
        return events[eventId];
    }
}
