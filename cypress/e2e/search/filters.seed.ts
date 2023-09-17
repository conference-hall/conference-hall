import { eventFactory } from '../../../tests/factories/events.ts';

export const seed = async () => {
  await eventFactory({
    attributes: {
      name: 'Conference CFP open',
      slug: 'conference-cfp-open',
    },
    traits: ['conference-cfp-open'],
  });
  await eventFactory({
    attributes: {
      name: 'Conference CFP future',
      slug: 'conference-cfp-future',
    },
    traits: ['conference-cfp-future'],
  });
  await eventFactory({
    attributes: {
      name: 'Conference CFP past',
      slug: 'conference-cfp-past',
    },
    traits: ['conference-cfp-past'],
  });
  await eventFactory({
    attributes: {
      name: 'Meetup CFP open',
      slug: 'meetup-cfp-open',
    },
    traits: ['meetup-cfp-open'],
  });
  await eventFactory({
    attributes: {
      name: 'Meetup CFP close',
      slug: 'meetup-cfp-close',
    },
    traits: ['meetup-cfp-close'],
  });
};
