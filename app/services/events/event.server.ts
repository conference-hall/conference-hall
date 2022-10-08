import { getCfpState } from '~/utils/event';
import { db } from '../db';
import { EventNotFoundError } from '../errors';

export async function getEvent(slug: string) {
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
    isCfpOpen: getCfpState(event.type, event.cfpStart, event.cfpEnd) === 'OPENED',
    hasTracks: event.categories.length > 0 || event.formats.length > 0,
    formats: event.formats.map((f) => ({
      id: f.id,
      name: f.name,
      description: f.description,
    })),
    categories: event.categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    })),
  };
}
