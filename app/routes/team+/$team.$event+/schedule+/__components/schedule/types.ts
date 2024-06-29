export type Track = { id: string; name: string };

export type TimeSlot = { start: Date; end: Date };

export type Session = { trackId: string; timeslot: TimeSlot };
