import { DataFunctionArgs } from '@remix-run/server-runtime';
import z from 'zod';
import { CfpState, getCfpState } from '~/utils/event';
import { db } from '../db';

const eventSlugParam = z.string().nonempty();

export interface EventDescription {
  slug: string;
  name: string;
  description: string;
  address: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  codeOfConductUrl: string | null;
  bannerUrl: string | null;
  type: 'CONFERENCE' | 'MEETUP';
  conferenceStart?: string;
  conferenceEnd?: string;
  cfpStart?: string;
  cfpEnd?: string;
  cfpState: CfpState;
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
}

export async function getEventDescription({ params }: DataFunctionArgs): Promise<EventDescription> {
  const criterias = eventSlugParam.safeParse(params.eventSlug);
  if (!criterias.success) {
    throw new Response('Bad search parameters', { status: 400 });
  }

  const slug = criterias.data;
  const event = await db.event.findUnique({ where: { slug }, include: { formats: true, categories: true } });
  if (!event) {
    throw new Response('Event not found', { status: 404 });
  }

  return {
    slug: event.slug,
    name: event.name,
    description: event.description,
    address: event.address,
    websiteUrl: event.websiteUrl,
    contactEmail: event.contactEmail,
    codeOfConductUrl: event.codeOfConductUrl,
    bannerUrl: event.bannerUrl,
    type: event.type,
    conferenceStart: event.conferenceStart?.toUTCString(),
    conferenceEnd: event.conferenceEnd?.toUTCString(),
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
    formats: event.formats.map((f) => ({ id: f.id, name: f.name, description: f.description })),
    categories: event.categories.map((c) => ({ id: c.id, name: c.name, description: c.description })),
  };
}
