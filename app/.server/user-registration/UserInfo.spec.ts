import { userFactory } from 'tests/factories/users';

import { UserInfo } from './UserInfo';

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
        isOrganizer: false,
        notificationsUnreadCount: 0,
      });
    });
  });
});
