import { organizationFactory } from '../../../tests/factories/organization';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const organizer = await userFactory({ traits: ['clark-kent'] });
  await organizationFactory({ owners: [organizer], attributes: { name: 'Awesome orga 1' } });
  await organizationFactory({ owners: [organizer], attributes: { name: 'Awesome orga 2' } });
  await organizationFactory({ owners: [organizer], attributes: { name: 'Awesome orga 3' } });
};
