import { makeDomainFunction } from 'domain-functions';
import { z } from 'zod';
import { db } from '~/services/db';
import { EventNotFoundError, SurveyNotEnabledError } from '~/services/errors';
import { jsonToArray } from '~/utils/prisma';
import { QUESTIONS } from './questions';

const Schema = z.object({
  eventSlug: z.string().min(1),
});

export const getSurveyQuestions = makeDomainFunction(Schema)(async ({ eventSlug }) => {
  const event = await db.event.findUnique({
    select: { id: true, surveyEnabled: true, surveyQuestions: true },
    where: { slug: eventSlug },
  });
  if (!event) throw new EventNotFoundError();

  const enabledQuestions = jsonToArray(event.surveyQuestions);
  if (!event.surveyEnabled || !enabledQuestions?.length) {
    throw new SurveyNotEnabledError();
  }

  return QUESTIONS.filter((question) => enabledQuestions.includes(question.name));
});
