import { eventFactory } from '../../../tests/factories/events.ts';
import { surveyFactory } from '../../../tests/factories/surveys.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const user = await userFactory({ traits: ['clark-kent'] });

  const event = await eventFactory({
    attributes: { name: 'Devfest Nantes 1', slug: 'devfest-nantes' },
    traits: ['conference', 'conference-cfp-open'],
  });

  await surveyFactory({
    user,
    event,
    attributes: {
      answers: {
        gender: 'male',
        tshirt: 'XL',
        accomodation: null,
        transports: ['taxi', 'train'],
        diet: ['vegan'],
        info: 'Hello',
      },
    },
  });
};
