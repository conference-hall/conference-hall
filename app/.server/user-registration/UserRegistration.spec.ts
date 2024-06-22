import { db } from 'prisma/db.server.ts';
import { userFactory } from 'tests/factories/users.ts';

import { UserRegistration } from './UserRegistration.ts';

describe('UserRegistration', () => {
  describe('register', () => {
    it('register a new user if doesnt exists', async () => {
      const userId = await UserRegistration.register({
        uid: '123',
        name: 'Bob',
        email: 'bob@example.com',
        picture: 'https://image.com/image.png',
        provider: 'google.com',
      });

      const user = await db.user.findFirst({ where: { id: userId }, include: { accounts: true } });
      expect(user?.name).toEqual('Bob');
      expect(user?.email).toEqual('bob@example.com');
      expect(user?.picture).toEqual('https://image.com/image.png');
      expect(user?.accounts[0].uid).toEqual('123');
      expect(user?.accounts[0].name).toEqual('Bob');
      expect(user?.accounts[0].email).toEqual('bob@example.com');
      expect(user?.accounts[0].picture).toEqual('https://image.com/image.png');
      expect(user?.accounts[0].provider).toEqual('google.com');
    });

    it('returns existing user id if already exists', async () => {
      const user = await userFactory();
      const account = await db.account.findFirst({ where: { userId: user.id } });

      if (!account) throw new Error('Account not found');

      const userId = await UserRegistration.register({
        uid: account.uid,
        name: 'Bob',
        email: 'bob@example.com',
        picture: 'https://image.com/image.png',
        provider: 'google.com',
      });

      expect(userId).toEqual(user.id);
    });
  });
});
