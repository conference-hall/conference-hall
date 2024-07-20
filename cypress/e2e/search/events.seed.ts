import { eventFactory } from '../../../tests/factories/events.ts';

export const seed = async () => {
  await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      location: 'Nantes, France',
    },
    traits: ['conference-cfp-open'],
  });
  await eventFactory({
    attributes: {
      name: 'GDG Nantes',
      slug: 'gdg-nantes',
      location: 'Nantes, France',
    },
    traits: ['meetup-cfp-open'],
  });
};
