import { organizerKeyFactory } from '../../../tests/factories/organizer-key.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  // user without organizer access
  await userFactory({ traits: ['bruce-wayne'] });

  // organizer without team and with organizer access
  await userFactory({ traits: ['peter-parker'], isOrganizer: true });

  await organizerKeyFactory({ attributes: { id: '123456' } });
};
