import { db } from '../db';
import { EventNotFoundError } from '../errors';
import type { SurveyData } from '~/schemas/survey';

export async function getSurveyAnswers(slug: string, uid: string) {
  const userSurvey = await db.survey.findFirst({
    select: { answers: true },
    where: { event: { slug }, user: { id: uid } },
  });

  return (userSurvey?.answers ?? {}) as Record<string, unknown>;
}

export async function saveSurvey(uid: string, slug: string, answers: SurveyData) {
  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  await db.survey.upsert({
    where: { userId_eventId: { eventId: event.id, userId: uid } },
    update: { answers },
    create: {
      event: { connect: { id: event.id } },
      user: { connect: { id: uid } },
      answers: answers,
    },
  });
}
