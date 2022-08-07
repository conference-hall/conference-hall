import { eventFactory } from '../../tests/factories/events';
import { userFactory } from '../../tests/factories/users';
import { eventFormatFactory } from '../../tests/factories/formats';
import { eventCategoryFactory } from '../../tests/factories/categories';

export const seed = async () => {
  await userFactory({ traits: ['clark-kent'], attributes: { bio: '' } });
  const event = await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      address: 'Nantes, France',
      description: 'The event !',
    },
    traits: ['conference', 'conference-cfp-open', 'withSurvey'],
  });
  await eventFormatFactory({ event, attributes: { name: 'Quickie' } });
  await eventCategoryFactory({ event, attributes: { name: 'Web' } });
};
