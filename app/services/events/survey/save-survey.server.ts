import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { repeatable, text } from 'zod-form-data';
import { db } from '~/services/db';
import { EventNotFoundError } from '~/services/errors';

const Schema = z.object({
  eventSlug: z.string().min(1),
  speakerId: z.string().min(1),
  data: z.object({
    gender: text(z.string().trim().nullable().default(null)),
    tshirt: text(z.string().trim().nullable().default(null)),
    accomodation: text(z.string().trim().nullable().default(null)),
    transports: repeatable(z.array(z.string().trim())).optional().nullable().default(null),
    diet: repeatable(z.array(z.string().trim())).optional().nullable().default(null),
    info: text(z.string().trim().nullable().default(null)),
  }),
});

export const saveSurvey = makeDomainFunction(Schema)(async ({ eventSlug, speakerId, data }) => {
  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new EventNotFoundError();

  await db.survey.upsert({
    where: { userId_eventId: { eventId: event.id, userId: speakerId } },
    update: { answers: data },
    create: {
      event: { connect: { id: event.id } },
      user: { connect: { id: speakerId } },
      answers: data,
    },
  });
});
