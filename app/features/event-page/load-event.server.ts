import { DataFunctionArgs } from '@remix-run/server-runtime';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../../services/db';

export interface EventDescription {
  description: string;
  websiteUrl: string | null;
  contactEmail: string | null;
  codeOfConductUrl: string | null;
  bannerUrl: string | null;
  type: 'CONFERENCE' | 'MEETUP';
  cfpStart?: string;
  cfpEnd?: string;
  cfpState: CfpState;
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
}

export async function getEventDescription({ params }: DataFunctionArgs): Promise<EventDescription> {
  const event = await db.event.findUnique({
    where: { slug: params.eventSlug },
    include: { formats: true, categories: true },
  });
  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  return {
    description: event.description,
    websiteUrl: event.websiteUrl,
    contactEmail: event.contactEmail,
    codeOfConductUrl: event.codeOfConductUrl,
    bannerUrl: event.bannerUrl,
    type: event.type,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    formats: event.formats.map((f) => ({ id: f.id, name: f.name, description: f.description })),
    categories: event.categories.map((c) => ({ id: c.id, name: c.name, description: c.description })),
  };
}
