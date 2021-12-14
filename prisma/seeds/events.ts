import { buildCategory } from '../../tests/factories/categories';
import { buildEvent } from '../../tests/factories/events';
import { buildFormat } from '../../tests/factories/formats';

export default async () => {
  const event1 = await buildEvent({
    name: 'Devfest Nantes',
    slug: 'devfest-nantes',
    description: 'The event !',
    address: 'La Cité des Congrès, Nantes, France',
    type: 'CONFERENCE',
    visibility: 'PUBLIC',
    websiteUrl: 'https://devfest.gdgnantes.com',
    contactEmail: 'devfest@example.com',
    codeOfConductUrl: 'https://devfest.gdgnantes.com',
    conferenceStart: '2091-11-20T00:00:00.000Z',
    conferenceEnd: '2091-11-21T00:00:00.000Z',
    cfpStart: '2020-10-05T14:48:00.000Z',
    cfpEnd: '2090-10-05T14:48:00.000Z',
    surveyEnabled: true,
    surveyQuestions: ['gender', 'tshirt', 'diet', 'accomodation', 'transports', 'info'],
    creatorId: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
  });

  buildFormat({
    eventId: event1.id,
    name: 'Conference (50 min)',
    description: 'It could be a live code, slides, or both. 50min including Q&A',
  });

  buildFormat({
    eventId: event1.id,
    name: 'Quickie (20 min)',
    description: 'A short talk. 20min including Q&A',
  });

  buildFormat({
    eventId: event1.id,
    name: 'Codelab (2 hours)',
    description: "Hand's On! Let's code. 2 hours workshop",
  });

  buildCategory({
    eventId: event1.id,
    name: 'Web',
    description: 'All Frameworks, libraries, HTML, CSS...',
  });

  buildCategory({
    eventId: event1.id,
    name: 'Cloud & DevOps',
    description: 'Tools / solutions / methods to run our app.',
  });

  buildCategory({
    eventId: event1.id,
    name: 'Mobile & IoT',
    description: 'All Mobile, IoT subjects',
  });

  buildCategory({
    eventId: event1.id,
    name: 'UX / UI',
    description: 'Everything about Design & UX.',
  });

  await buildEvent({
    name: 'Devoxx France',
    slug: 'devoxx-france',
    description: 'A Devoxx event',
    address: 'Le Palais des Congrès, Paris, France',
    type: 'CONFERENCE',
    visibility: 'PUBLIC',
    conferenceStart: '2091-11-20T00:00:00.000Z',
    conferenceEnd: '2091-11-20T00:00:00.000Z',
    cfpStart: '2020-10-05T14:48:00.000Z',
    cfpEnd: '2090-10-05T14:48:00.000Z',
    creatorId: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
  });

  await buildEvent({
    name: 'GDG Nantes',
    slug: 'gdg-nantes',
    description: 'The meetup to be!',
    address: 'Nantes, France',
    type: 'MEETUP',
    visibility: 'PUBLIC',
    cfpStart: '2020-10-05T14:48:00.000Z',
    cfpEnd: null,
    creatorId: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
  });

  await buildEvent({
    name: 'VIP event',
    slug: 'vip-event',
    description: 'This is very selective',
    address: 'London, UK',
    type: 'CONFERENCE',
    visibility: 'PRIVATE',
    cfpStart: null,
    cfpEnd: null,
    creatorId: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
  });
};
