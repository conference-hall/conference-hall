import type { SurveyQuestions } from '~/types/survey.types';

export const questions: SurveyQuestions = [
  {
    id: 'gender',
    label: "What's your gender?",
    type: 'radio',
    required: false,
    options: [
      { id: 'male', label: 'Male' },
      { id: 'female', label: 'Female' },
      { id: 'genderless', label: 'Genderless' },
    ],
  },
  {
    id: 'tshirt',
    label: "What's your Tshirt size?",
    type: 'radio',
    required: false,
    options: [
      { id: 'S', label: 'S' },
      { id: 'M', label: 'M' },
      { id: 'L', label: 'L' },
      { id: 'XL', label: 'XL' },
      { id: 'XXL', label: 'XXL' },
      { id: 'XXXL', label: 'XXXL' },
    ],
  },
  {
    id: 'accomodation',
    label: 'Do you need accommodation funding? (Hotel, AirBnB...)',
    type: 'radio',
    required: false,
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
  },
  {
    id: 'transports',
    label: 'Do you need transports funding?',
    type: 'checkbox',
    required: false,
    options: [
      { id: 'taxi', label: 'Taxi' },
      { id: 'train', label: 'Train' },
      { id: 'plane', label: 'Plane' },
    ],
  },
  {
    id: 'diet',
    label: 'Do you have any special diet restrictions?',
    type: 'checkbox',
    required: false,
    options: [
      { id: 'vegetarian', label: 'Vegetarian' },
      { id: 'vegan', label: 'Vegan' },
      { id: 'halal', label: 'Halal' },
      { id: 'gluten-free', label: 'Gluten-free' },
      { id: 'nut allergy', label: 'Nut allergy' },
    ],
  },
  {
    id: 'info',
    label: 'Do you have specific information to share?',
    type: 'text',
    required: false,
  },
];
