import { json, LoaderFunction } from 'remix';
import { db } from '../../services/db';
import { getCfpState } from '../../utils/event';

export interface EventHeader {
  slug: string;
  type: 'CONFERENCE' | 'MEETUP';
  name: string;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
  cfpState: string;
  surveyEnabled: boolean;
}

export const loadEventHeader: LoaderFunction = async ({ params }) => {
  const event = await db.event.findUnique({
    select: {
      slug: true,
      type: true,
      name: true,
      address: true,
      conferenceStart: true,
      conferenceEnd: true,
      cfpStart: true,
      cfpEnd: true,
      surveyEnabled: true,
    },
    where: { slug: params.eventSlug },
  });

  if (!event) throw new Response('Event not found.', { status: 404 });

  return json<EventHeader>({
    slug: event.slug,
    name: event.name,
    type: event.type,
    address: event.address,
    conferenceStart: event.conferenceStart?.toUTCString(),
    conferenceEnd: event.conferenceEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    surveyEnabled: event.surveyEnabled,
  });
};
