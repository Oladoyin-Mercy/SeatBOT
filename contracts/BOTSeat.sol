// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BOTSeat
 * @dev Blockchain-powered event seat reservation smart contract on BOT Chain.
 * Prevents double-booking, validates seat layouts, tracks active seat state,
 * and generates verifiable on-chain reservation records.
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
        string metadataURI; // JSON metadata containing banner image, layout format, etc.
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
    
    // Dynamic reserved seats tracking with O(1) swap-and-pop removal on cancellation
    mapping(uint256 => string[]) private _eventReservedSeats;
    mapping(uint256 => mapping(string => uint256)) private _seatToArrayIndex; // 1-indexed (0 means not in array)
    
    uint256[] private _allEventIds;

    // Custom Errors
    error EventNotFound();
    error EventInactive();
    error SeatAlreadyReserved(string seatId);
    error InvalidSeatId();
    error SeatOutOfBounds(string seatId, uint256 maxSeats);
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
        _eventIdCounter = 1;
        _reservationIdCounter = 1;
    }

    /**
     * @notice Validates that seatId conforms to valid structure and does not exceed event seat capacity
     * @param seatId The seat code (e.g. "A01", "A24", "B10", "25")
     * @param totalSeats Total seats configured for the event
     */
    function _validateSeatId(string memory seatId, uint256 totalSeats) internal pure {
        bytes memory b = bytes(seatId);
        uint256 len = b.length;
        if (len == 0 || len > 10) revert InvalidSeatId();

        uint256 startIdx = 0;
        bytes1 firstChar = b[0];

        // Optional row letter prefix (A-Z or a-z)
        if ((firstChar >= 0x41 && firstChar <= 0x5A) || (firstChar >= 0x61 && firstChar <= 0x7A)) {
            startIdx = 1;
            if (len == 1) revert InvalidSeatId(); // Must include numbers after letter
        }

        // Parse remaining characters as numeric seat number
        uint256 seatNum = 0;
        for (uint256 i = startIdx; i < len; i++) {
            bytes1 char = b[i];
            if (char < 0x30 || char > 0x39) {
                revert InvalidSeatId();
            }
            seatNum = seatNum * 10 + (uint256(uint8(char)) - 48);
        }

        if (seatNum == 0 || seatNum > totalSeats) {
            revert SeatOutOfBounds(seatId, totalSeats);
        }
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
     * @notice Reserve a specific seat for an event (atomic double-booking prevention)
     * @dev Attendee pays network gas only. No extra payment is accepted or retained.
     * @param eventId The ID of the event
     * @param seatId The seat code (e.g. "A24", "B03")
     */
    function reserveSeat(
        uint256 eventId,
        string memory seatId
    ) external returns (uint256) {
        Event storage evt = events[eventId];
        if (evt.id == 0) revert EventNotFound();
        if (!evt.isActive) revert EventInactive();
        
        // Validate seat format and ensure seat number does not exceed event capacity
        _validateSeatId(seatId, evt.totalSeats);

        // Prevent double booking
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

        // Track in reserved seats array with 1-based index mapping
        _eventReservedSeats[eventId].push(seatId);
        _seatToArrayIndex[eventId][seatId] = _eventReservedSeats[eventId].length;

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
     * @dev Reclaims seat availability, removes from active seat list, and decrements reserved count
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

        // Remove seat from _eventReservedSeats array using O(1) swap-and-pop
        uint256 index1Based = _seatToArrayIndex[res.eventId][res.seatId];
        if (index1Based > 0) {
            uint256 idx = index1Based - 1;
            uint256 lastIdx = _eventReservedSeats[res.eventId].length - 1;
            if (idx != lastIdx) {
                string memory lastSeat = _eventReservedSeats[res.eventId][lastIdx];
                _eventReservedSeats[res.eventId][idx] = lastSeat;
                _seatToArrayIndex[res.eventId][lastSeat] = index1Based;
            }
            _eventReservedSeats[res.eventId].pop();
            delete _seatToArrayIndex[res.eventId][res.seatId];
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
        if (events[eventId].id == 0 || !events[eventId].isActive) return false;
        return !isSeatReserved[eventId][seatId];
    }

    /**
     * @notice Get all active reserved seat IDs for an event (excludes cancelled seats)
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
