import { userFactory } from 'tests/factories/users.ts';

import { UserInfo } from './user-info.ts';

describe('UserInfo', () => {
  describe('get', () => {
    it('returns the default response', async () => {
      const user = await userFactory();

      const response = await UserInfo.get(user.id);
      expect(response).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        teams: [],
        hasTeamAccess: false,
        notificationsUnreadCount: 0,
      });
    });
  });
});
