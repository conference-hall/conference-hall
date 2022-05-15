import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../../services/db';

export interface EventData {
  id: string;
  slug: string;
  type: 'CONFERENCE' | 'MEETUP';
  name: string;
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
  surveyEnabled: boolean;
  description: string;
  websiteUrl: string | null;
  contactEmail: string | null;
  codeOfConductUrl: string | null;
  bannerUrl: string | null;
  cfpStart?: string;
  cfpEnd?: string;
  cfpState: CfpState;
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
}

export const loadEvent: LoaderFunction = async ({ params }) => {
  const event = await db.event.findUnique({
    where: { slug: params.eventSlug },
    include: { formats: true, categories: true },
  });
  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  return json<EventData>({
    id: event.id,
    slug: event.slug,
    type: event.type,
    name: event.name,
    description: event.description,
    address: event.address,
    conferenceStart: event.conferenceStart?.toUTCString(),
    conferenceEnd: event.conferenceEnd?.toUTCString(),
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    surveyEnabled: event.surveyEnabled,
    websiteUrl: event.websiteUrl,
    contactEmail: event.contactEmail,
    codeOfConductUrl: event.codeOfConductUrl,
    bannerUrl: event.bannerUrl,
    formats: event.formats.map((f) => ({ id: f.id, name: f.name, description: f.description })),
    categories: event.categories.map((c) => ({ id: c.id, name: c.name, description: c.description })),
  });
}
