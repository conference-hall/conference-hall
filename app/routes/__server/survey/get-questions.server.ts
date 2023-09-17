import { db } from '~/libs/db.ts';
import { EventNotFoundError, SurveyNotEnabledError } from '~/libs/errors.ts';
import { jsonToArray } from '~/libs/prisma.ts';
import type { SurveyQuestions } from '~/routes/__types/survey.ts';

export async function getQuestions(slug: string) {
  const event = await db.event.findUnique({
    select: { id: true, surveyEnabled: true, surveyQuestions: true },
    where: { slug: slug },
  });
  if (!event) throw new EventNotFoundError();

  if (!event.surveyEnabled) throw new SurveyNotEnabledError();

  const enabledQuestions = jsonToArray(event.surveyQuestions);
  return QUESTIONS.filter((question) => enabledQuestions.includes(question.name));
}

export const QUESTIONS: SurveyQuestions = [
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
