import { db } from '../../../libs/db';

export async function getAnswers(slug: string, userId: string) {
  const userSurvey = await db.survey.findFirst({
    select: { answers: true },
    where: { event: { slug }, user: { id: userId } },
  });

  return (userSurvey?.answers ?? {}) as Record<string, unknown>;
}
