import { eventFactory } from '../../../tests/factories/events';
import { surveyFactory } from '../../../tests/factories/surveys';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const user = await userFactory({ traits: ['clark-kent'] });

  const event = await eventFactory({
    attributes: { name: 'Devfest Nantes 1', slug: 'devfest-nantes' },
    traits: ['conference', 'conference-cfp-open', 'withSurvey'],
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
