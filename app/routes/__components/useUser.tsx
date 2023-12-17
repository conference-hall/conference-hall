import { useOutletContext } from '@remix-run/react';

import type { UserInfoData } from '../../.server/user-registration/UserInfo';

export function useUser() {
  return useOutletContext<{ user: UserInfoData }>();
}
