import { NextResponse } from 'next/server';
import { dbData } from '../constants';



export async function GET() {
  return NextResponse.json({ participants: dbData.participants });
}

export async function POST(req: Request) {
  console.log('Request body:', req.body);
  const body = await req.json();
  const { participant_ids, date_range } = body;
  const { start, end } = date_range;

  const availableSlots = checkParticipantAvailableSlots(
    participant_ids,
    start,
    end
  );
  return NextResponse.json({ availableSlots });
}

// Function for checking participant available slots
function checkParticipantAvailableSlots(participant_ids, start, end) {
  // Helper function to generate 30-minute time slots between two times
  function generateTimeSlots(startTime, endTime) {
    const slots = [];
    let current = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    while (current < end) {
      let next = new Date(current.getTime() + 30 * 60000); // Add 30 minutes
      let formattedSlot = `${current.toTimeString().slice(0, 5)}-${next.toTimeString().slice(0, 5)}`;
      slots.push(formattedSlot);
      current = next;
    }
    return slots;
  }

  // Helper function to check if a time slot is available for a participant on a particular day
  function isSlotAvailable(participantId, day, slot, schedules) {
    if (!schedules[participantId] || !schedules[participantId][day])
      return true;

    for (let meeting of schedules[participantId][day]) {
      const meetingStart = new Date(`1970-01-01T${meeting.start}:00`);
      const meetingEnd = new Date(`1970-01-01T${meeting.end}:00`);
      const slotStart = new Date(`1970-01-01T${slot.split('-')[0]}:00`);
      const slotEnd = new Date(`1970-01-01T${slot.split('-')[1]}:00`);

      if (slotStart < meetingEnd && slotEnd > meetingStart) {
        return false;
      }
    }
    return true;
  }

  // Convert date range to an array of days
  const startDate = new Date(start.split('/').reverse().join('-'));
  const endDate = new Date(end.split('/').reverse().join('-'));
  const dateRange = [];
  for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
    dateRange.push(new Date(d).toLocaleDateString('en-GB'));
  }

  const commonSlots = {};

  // Iterate through each date in the range
  for (const date of dateRange) {
    const dayOfWeek = new Date(
      date.split('/').reverse().join('-')
    ).toLocaleString('en-US', { weekday: 'long' });

    // Initialize a map to store common slots for this date
    let commonAvailableSlots = [];

    // Generate available slots for all participants for the current day
    for (const participantId of participant_ids) {
      const availability =
        dbData.participantAvailability[participantId][dayOfWeek];
      if (!availability) {
        commonAvailableSlots = []; // No availability for this participant on this day
        break;
      }

      let participantSlots = [];
      for (const timeRange of availability) {
        const slots = generateTimeSlots(timeRange.start, timeRange.end);
        participantSlots.push(...slots);
      }

      // Check if the participant's slots conflict with their existing schedule
      participantSlots = participantSlots.filter(slot =>
        isSlotAvailable(participantId, date, slot, dbData.schedules)
      );

      // If this is the first participant, initialize common slots
      if (commonAvailableSlots.length === 0) {
        commonAvailableSlots = participantSlots;
      } else {
        // Find intersection with already found common slots
        commonAvailableSlots = commonAvailableSlots.filter(slot =>
          participantSlots.includes(slot)
        );
      }
    }

    // If common slots are found, check the threshold limit
    if (commonAvailableSlots.length > 0) {
      for (const participantId of participant_ids) {
        const threshold = dbData.participants[participantId].threshold;
        const meetingsOnDay =
          dbData.schedules[participantId]?.[date]?.length || 0;
        const maxAvailableSlots = Math.max(0, threshold - meetingsOnDay);

        // Remove slots that exceed the threshold for this participant
        if (maxAvailableSlots < commonAvailableSlots.length) {
          commonAvailableSlots = commonAvailableSlots.slice(
            0,
            maxAvailableSlots
          );
        }
      }

      if (commonAvailableSlots.length > 0) {
        commonSlots[date] = commonAvailableSlots;
      }
    }
  }

  return commonSlots;
}
