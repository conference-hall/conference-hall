import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';

const Schema = z.object({
  eventSlug: z.string().min(1),
  speakerId: z.string().min(1),
});

export const getSurveyAnswers = makeDomainFunction(Schema)(async ({ eventSlug, speakerId }) => {
  const userSurvey = await db.survey.findFirst({
    select: { answers: true },
    where: { event: { slug: eventSlug }, user: { id: speakerId } },
  });

  return (userSurvey?.answers ?? {}) as Record<string, unknown>;
});
