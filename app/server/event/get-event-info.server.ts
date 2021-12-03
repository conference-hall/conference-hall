import { DataFunctionArgs } from '@remix-run/server-runtime';
import z from 'zod';
import { db } from '../db';

const eventSlugParam = z.string().nonempty();

export interface EventInfo {
  id: string;
  name: string;
  type: 'CONFERENCE' | 'MEETUP';
  address: string | null;
  conferenceStart?: string;
  conferenceEnd?: string;
};

export async function getEventInfo({ params }: DataFunctionArgs): Promise<EventInfo> {
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
    type: event.type,
    address: event.address,
    conferenceStart: event.conferenceStart?.toUTCString(),
    conferenceEnd: event.conferenceEnd?.toUTCString(),
  };
}
