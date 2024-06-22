import { useOutletContext } from '@remix-run/react';

import type { UserInfoData } from '../../.server/user-registration/user-info';

export function useUser() {
  return useOutletContext<{ user: UserInfoData }>();
}
