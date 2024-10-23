'use client';

import { useEffect, useState } from 'react';
import { Typography, MenuItem, Select, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

export default function ParticipantAvailability() {
    const [participants, setParticipants] = useState<Record<string, any>>({});

  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [availableSlots, setAvailableSlots] = useState<any>(null);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert('Please select valid dates.');
      return;
    }

    const input = {
      participant_ids: selectedParticipants,
      date_range: {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD'),
      },
    };
    console.log('Input:', input);

    const response = await fetch('/api/find-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = await response.json();
    setAvailableSlots(data?.availableSlots);
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      const response = await fetch('/api/participants');
      const data = await response.json();
      setParticipants(data?.participants);
    };

    fetchParticipants();
  }, []);

  return (
    <div>
      <Typography variant="h4" color='#000'>Find Overlapping Meeting Slots</Typography>

      {/* Multiselect Dropdown for Participants */}
      <Select
        multiple
        value={selectedParticipants}
        onChange={e => setSelectedParticipants(e.target.value as string[])}
        fullWidth
        displayEmpty
        style={{ marginBottom: '20px', marginTop: '20px' }}
      >
        {Object.entries(participants).map(([id, participant]) => (
          <MenuItem key={id} value={id}>
            {participant.name}
          </MenuItem>
        ))}
      </Select>

      {/* Date Range Picker */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(date) => setStartDate(date)}
            renderInput={(params) => <input {...params} />}
          />

          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(date) => setEndDate(date)}
            renderInput={(params) => <input {...params} />}
          />
        </LocalizationProvider>
      </div>

      {/* Find Slots Button */}
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Find Slots
      </Button>

      {/* Display Available Slots */}
      {availableSlots && Object.keys(availableSlots).length!==0 && (
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h6" color='#000'>Available Slots</Typography>
          {Object.keys(availableSlots).map(date => (
            <div key={date} style={{display:"flex", gap:"10px"}}>
              <Typography color='#000' fontWeight={600}>{date}</Typography>
              <Typography color='#000'>{availableSlots[date].join(', ')}</Typography>
            </div>
          ))}
        </div>
      )}

      {
        availableSlots && Object.keys(availableSlots).length===0 && (
          <Typography variant="h6" color='#000'>No common slots found</Typography>
        )
      }
    </div>
  );
}