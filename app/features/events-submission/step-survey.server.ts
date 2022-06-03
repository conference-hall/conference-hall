import { z } from 'zod';
import { db } from '../../services/db';
import { QUESTIONS, SurveyQuestions } from '../../services/survey/questions';
import { jsonToArray } from '../../utils/prisma';

export type SurveyAnswers = { [key: string]: string | string[] | null };

export async function getSurveyQuestions(slug: string): Promise<SurveyQuestions> {
  const event = await db.event.findUnique({
    select: { id: true, surveyEnabled: true, surveyQuestions: true },
    where: { slug: slug },
  });
  if (!event) throw new EventNotFoundError();

  const enabledQuestions = jsonToArray(event.surveyQuestions);
  if (!event.surveyEnabled || !enabledQuestions?.length) {
    throw new SurveyNotEnabledError();
  }

  return QUESTIONS.filter((question) => enabledQuestions.includes(question.name))
};

export async function getSurveyAnswers(slug: string, uid: string): Promise<SurveyAnswers> {
  const userSurvey = await db.survey.findFirst({
    select: { answers: true },
    where: { event: { slug }, user: { id: uid } },
  });

  return (userSurvey?.answers ?? {}) as SurveyAnswers;
};

export async function saveSurvey(uid: string, slug: string, answers: SurveyData) {
  const event = await db.event.findUnique({ select: { id: true }, where: { slug } });
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
};

type SurveyData = z.infer<typeof SurveySchema>;

const SurveySchema = z.object({
  gender: z.string().nullable(),
  tshirt: z.string().nullable(),
  accomodation: z.string().nullable(),
  transports: z.array(z.string()).nullable(),
  diet: z.array(z.string()).nullable(),
  info: z.string().nullable(),
});

export function validateSurveyForm(form: FormData) {
  return SurveySchema.safeParse({
    gender: form.get('gender'),
    tshirt: form.get('tshirt'),
    accomodation: form.get('accomodation'),
    transports: form.getAll('transports'),
    diet: form.getAll('diet'),
    info: form.get('info'),
  });
}

export class EventNotFoundError extends Error {
  constructor() {
    super('Event not found');
    this.name = 'EventNotFoundError';
  }
}

export class SurveyNotEnabledError extends Error {
  constructor() {
    super('Survey not enabled');
    this.name = 'SurveyNotEnabledError';
  }
}
