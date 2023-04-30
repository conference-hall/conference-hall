import { organizationFactory } from '../../../tests/factories/organization';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });

  await userFactory({ traits: ['bruce-wayne'] });

  await organizationFactory({
    attributes: { name: 'Awesome orga', slug: 'awesome-orga', invitationCode: '123' },
    owners: [organizer1],
  });
};
