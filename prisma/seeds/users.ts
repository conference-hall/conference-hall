import { buildUser } from '../../tests/factories/users';

export default async () => {
  await buildUser({ id: 'user1', name: 'boby' });
};
