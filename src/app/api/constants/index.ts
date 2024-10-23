export const dbData = {
    participants: {
      1: { name: 'Adam', threshold: 4 },
      2: { name: 'Bosco', threshold: 4 },
      3: { name: 'Catherine', threshold: 5 },
    },
    participantAvailability: {
      1: {
        Monday: [
          { start: '09:00', end: '11:00' },
          { start: '14:00', end: '16:30' },
        ],
        Tuesday: [{ start: '09:00', end: '18:00' }],
      },
      2: {
        Monday: [{ start: '09:00', end: '18:00' }],
        Tuesday: [{ start: '09:00', end: '11:30' }],
      },
      3: {
        Monday: [{ start: '09:00', end: '18:00' }],
        Tuesday: [{ start: '09:00', end: '18:00' }],
      },
    },
    schedules: {
      1: {
        '28/10/2024': [
          { start: '09:30', end: '10:30' },
          { start: '15:00', end: '16:30' },
        ],
      },
      2: {
        '28/10/2024': [{ start: '13:00', end: '13:30' }],
        '29/10/2024': [{ start: '09:00', end: '10:30' }],
      },
    },
  };