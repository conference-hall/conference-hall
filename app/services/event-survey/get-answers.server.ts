import { db } from '../../libs/db';

export async function getAnswers(slug: string, uid: string) {
  const userSurvey = await db.survey.findFirst({
    select: { answers: true },
    where: { event: { slug }, user: { id: uid } },
  });

  return (userSurvey?.answers ?? {}) as Record<string, unknown>;
}
