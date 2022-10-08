import { userFactory } from '../../../tests/factories/users';
import { inviteFactory } from '../../../tests/factories/invite';
import { organizationFactory } from '../../../tests/factories/organization';

export const seed = async () => {
  const owner = await userFactory({ traits: ['clark-kent'] });
  await userFactory({ traits: ['bruce-wayne'] });

  const organization = await organizationFactory({
    attributes: { name: 'Awesome organization' },
    owners: [owner],
  });

  await inviteFactory({ organization, user: owner, attributes: { id: 'invitation-1' } });
};
