import { eventFactory } from '../../../tests/factories/events';

export const seed = async () => {
  await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      address: 'Nantes, France',
      description: 'The event !',
      conferenceStart: '2020-10-05T00:00:00.000Z',
      conferenceEnd: '2020-10-05T00:00:00.000Z',
      cfpStart: '2020-10-05T00:00:00.000Z',
      cfpEnd: '2020-10-05T23:59:59.000Z',
    },
    traits: ['conference'],
  });
};
