import { organizationFactory } from '../../../tests/factories/organization';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  // user without organizer access
  await userFactory({ traits: ['bruce-wayne'] });

  // organizer without organization
  await userFactory({ traits: ['peter-parker'], isOrganizer: true });

  // organizer with organization
  const organizer = await userFactory({ traits: ['clark-kent'] });
  await organizationFactory({ owners: [organizer], attributes: { name: 'Awesome orga' } });
};
