import type { LoaderFunction } from '@remix-run/node';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../services/db';

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

export async function getEventPage(slug: string): Promise<EventData> {
  const event = await db.event.findUnique({
    where: { slug: slug },
    include: { formats: true, categories: true },
  });
  if (!event) {
    throw new EventNotFoundError();
  }

  return {
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
  };
}

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found');
    this.name = 'EventNotFoundError';
  }
}
