import type { TimeSlot } from '~/libs/datetimes/timeslots.ts';
import type { ConfirmationStatus, DeliberationStatus, Language } from '~/types/proposals.types.ts';

export type Track = { id: string; name: string };

export type ScheduleSession = {
  id: string;
  trackId: string;
  timeslot: TimeSlot;
  name?: string | null;
  language: Language | null;
  color: string;
  emojis: string[];
  proposal?: ScheduleProposalData | null;
  isCreating?: boolean;
};

export type SessionData = {
  id: string;
  trackId: string;
  start: Date;
  end: Date;
  name?: string | null;
  language: Language | null;
  color: string;
  emojis: string[];
  proposal?: ScheduleProposalData | null;
  isCreating?: boolean;
};

export type ScheduleProposalData = {
  id: string;
  title: string;
  deliberationStatus: DeliberationStatus;
  confirmationStatus: ConfirmationStatus | null;
  formats?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  speakers: Array<{
    name: string | null;
    picture: string | null;
  }>;
};
