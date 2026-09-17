export const BOTSEAT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EmptyEventName",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EventInactive",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EventNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSeatCount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidSeatId",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReservationAlreadyCancelled",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReservationNotFound",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "seatId",
        "type": "string"
      }
    ],
    "name": "SeatAlreadyReserved",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "seatId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxSeats",
        "type": "uint256"
      }
    ],
    "name": "SeatOutOfBounds",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "Unauthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "venue",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "dateTimestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "totalSeats",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "name": "EventCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reservationId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "seatId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "attendee",
        "type": "address"
      }
    ],
    "name": "ReservationCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reservationId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "seatId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "attendee",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "SeatReserved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "reservationId",
        "type": "uint256"
      }
    ],
    "name": "cancelReservation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "seatId",
        "type": "string"
      }
    ],
    "name": "checkSeatAvailability",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isAvailable",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "venue",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "dateTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSeats",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      }
    ],
    "name": "createEvent",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "events",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "venue",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "dateTimestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSeats",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "reservedCount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "organizer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "metadataURI",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllEvents",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "venue",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "dateTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalSeats",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reservedCount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "organizer",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct BOTSeat.Event[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "getEvent",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "venue",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "dateTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalSeats",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reservedCount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "organizer",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct BOTSeat.Event",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "getEventReservations",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "reservationId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "eventId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "seatId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "attendee",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "reservedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isCancelled",
            "type": "bool"
          }
        ],
        "internalType": "struct BOTSeat.Reservation[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEventsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      }
    ],
    "name": "getReservedSeats",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserReservations",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "reservationId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "eventId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "seatId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "attendee",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "reservedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isCancelled",
            "type": "bool"
          }
        ],
        "internalType": "struct BOTSeat.Reservation[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "isSeatReserved",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "reservations",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "reservationId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "seatId",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "attendee",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "reservedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isCancelled",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "eventId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "seatId",
        "type": "string"
      }
    ],
    "name": "reserveSeat",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "seatToReservationId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "reservationId",
        "type": "uint256"
      }
    ],
    "name": "verifyReservation",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isValid",
        "type": "bool"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "reservationId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "eventId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "seatId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "attendee",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "reservedAt",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "isCancelled",
            "type": "bool"
          }
        ],
        "internalType": "struct BOTSeat.Reservation",
        "name": "res",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "venue",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "dateTimestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalSeats",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "reservedCount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "organizer",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "metadataURI",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          }
        ],
        "internalType": "struct BOTSeat.Event",
        "name": "evt",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
