import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';

export type EventTracks = Array<{ id: string; name: string; description: string | null }>;

export type EventSubmissionInfo = {
  id: string;
  isCfpOpen: boolean;
  hasSurvey: boolean;
  hasTracks: boolean;
  formats: EventTracks;
  categories: EventTracks;
  codeOfConductUrl: string | null;
};

export async function getEventSubmissionInfo(slug: string): Promise<EventSubmissionInfo> {
  const event = await db.event.findUnique({
    select: {
      id: true,
      type: true,
      cfpStart: true,
      cfpEnd: true,
      surveyEnabled: true,
      surveyQuestions: true,
      formats: true,
      categories: true,
      codeOfConductUrl: true,
    },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  const hasSurvey = event.surveyEnabled;
  const hasTracks = event.categories.length > 0 || event.formats.length > 0;

  return {
    id: event.id,
    hasSurvey,
    hasTracks,
    isCfpOpen,
    formats: event.formats,
    categories: event.categories,
    codeOfConductUrl: event.codeOfConductUrl,
  };
}

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found');
    this.name = 'EventNotFoundError';
  }
}
