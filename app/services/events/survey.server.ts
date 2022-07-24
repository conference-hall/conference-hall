import { z } from 'zod';
import { db } from '../db';
import { jsonToArray } from '../../utils/prisma';
import { EventNotFoundError, SurveyNotEnabledError } from '../errors';

export type SurveyAnswers = { [key: string]: string | string[] | null };

export async function getSurveyQuestions(
  slug: string
): Promise<SurveyQuestions> {
  const event = await db.event.findUnique({
    select: { id: true, surveyEnabled: true, surveyQuestions: true },
    where: { slug: slug },
  });
  if (!event) throw new EventNotFoundError();

  const enabledQuestions = jsonToArray(event.surveyQuestions);
  if (!event.surveyEnabled || !enabledQuestions?.length) {
    throw new SurveyNotEnabledError();
  }

  return QUESTIONS.filter((question) =>
    enabledQuestions.includes(question.name)
  );
}

export async function getSurveyAnswers(
  slug: string,
  uid: string
): Promise<SurveyAnswers> {
  const userSurvey = await db.survey.findFirst({
    select: { answers: true },
    where: { event: { slug }, user: { id: uid } },
  });

  return (userSurvey?.answers ?? {}) as SurveyAnswers;
}

export async function saveSurvey(
  uid: string,
  slug: string,
  answers: SurveyData
) {
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

export type SurveyQuestions = Array<{
  name: string;
  label: string;
  type: 'text' | 'checkbox' | 'radio';
  answers?: Array<{ name: string; label: string }>;
}>;

const QUESTIONS: SurveyQuestions = [
  {
    name: 'gender',
    label: "What's your gender?",
    type: 'radio',
    answers: [
      { name: 'male', label: 'Male' },
      { name: 'female', label: 'Female' },
      { name: 'genderless', label: 'Genderless' },
    ],
  },
  {
    name: 'tshirt',
    label: "What's your Tshirt size?",
    type: 'radio',
    answers: [
      { name: 'S', label: 'S' },
      { name: 'M', label: 'M' },
      { name: 'L', label: 'L' },
      { name: 'XL', label: 'XL' },
      { name: 'XXL', label: 'XXL' },
      { name: 'XXXL', label: 'XXXL' },
    ],
  },
  {
    name: 'accomodation',
    label: 'Do you need accommodation funding? (Hotel, AirBnB...)',
    type: 'radio',
    answers: [
      { name: 'yes', label: 'Yes' },
      { name: 'no', label: 'No' },
    ],
  },
  {
    name: 'transports',
    label: 'Do you need transports funding?',
    type: 'checkbox',
    answers: [
      { name: 'taxi', label: 'Taxi' },
      { name: 'train', label: 'Train' },
      { name: 'plane', label: 'Plane' },
    ],
  },
  {
    name: 'diet',
    label: 'Do you have any special diet restrictions?',
    type: 'checkbox',
    answers: [
      { name: 'vegetarian', label: 'Vegetarian' },
      { name: 'vegan', label: 'Vegan' },
      { name: 'halal', label: 'Halal' },
      { name: 'gluten-free', label: 'Gluten-free' },
      { name: 'nut allergy', label: 'Nut allergy' },
    ],
  },
  {
    name: 'info',
    label: 'Do you have specific information to share?',
    type: 'text',
  },
];
