import { db } from '~/libs/db';
import { EventNotFoundError } from '~/libs/errors';
import type { SurveyData } from '~/schemas/survey';

export async function saveSurvey(userId: string, slug: string, answers: SurveyData) {
  const event = await db.event.findUnique({
    select: { id: true },
    where: { slug },
  });
  if (!event) throw new EventNotFoundError();

  await db.survey.upsert({
    where: { userId_eventId: { eventId: event.id, userId: userId } },
    update: { answers },
    create: {
      event: { connect: { id: event.id } },
      user: { connect: { id: userId } },
      answers: answers,
    },
  });
}
