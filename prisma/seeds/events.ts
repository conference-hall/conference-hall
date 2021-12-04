import { buildEvent } from '../../tests/factories/events';

export default async () => {
  await buildEvent({
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
    creatorId: 'user1',
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
    creatorId: 'user1',
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
    creatorId: 'user1',
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
    creatorId: 'user1',
  });
};
