import { DataFunctionArgs } from '@remix-run/server-runtime';
import z from 'zod';
import { CfpState, getCfpState } from '../common/cfp-dates';
import { db } from '../db';

const eventSlugParam = z.string().nonempty();

export interface EventDescription {
  id: string;
  name: string;
  description: string;
  type: 'CONFERENCE' | 'MEETUP';
  address: string | null;
  cfpStart?: string;
  cfpEnd?: string;
  cfpState: CfpState;
};

export async function getEventDescription({ params }: DataFunctionArgs): Promise<EventDescription> {
  const criterias = eventSlugParam.safeParse(params.slug);
  if (!criterias.success) {
    throw new Response('Bad search parameters', { status: 400 });
  }

  const slug= criterias.data;
  const event = await db.event.findUnique({ where: { id: slug } });
  if (!event) {
    throw new Response('Event not found', { status: 404 }); 
  }

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    type: event.type,
    address: event.address,
    cfpStart: event.cfpStart?.toUTCString(),
    cfpEnd: event.cfpEnd?.toUTCString(),
    cfpState: getCfpState(event.type, event.cfpStart, event.cfpEnd),
  };
}
