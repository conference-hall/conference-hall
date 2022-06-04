import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';

export type EventSubmissionInfo ={
  id: string;
  isCfpOpen: boolean;
  hasSurvey: boolean;
  hasTracks: boolean;
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
      _count: { select: { formats: true, categories: true } },
    },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  const isCfpOpen = getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED';
  const hasSurvey = event.surveyEnabled;
  const hasTracks = event._count.categories > 0 || event._count.formats > 0;

  return { id: event.id, hasSurvey, hasTracks, isCfpOpen };
}

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found');
    this.name = 'EventNotFoundError';
  }
}
