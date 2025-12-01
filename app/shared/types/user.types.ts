import type { TeamRole } from '../user/team-permissions.ts';

export type AuthenticatedUser = {
  id: string;
  uid: string | null;
  name: string;
  email: string;
  picture: string | null;
  notificationsUnreadCount: number;
  hasTeamAccess: boolean;
  teams: Array<{
    slug: string;
    name: string;
    role: TeamRole;
    events: Array<{
      slug: string;
      name: string;
      logoUrl: string | null;
      archived: boolean;
    }>;
  }>;
};
