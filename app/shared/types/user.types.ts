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
    events: Array<{
      slug: string;
      name: string;
      archived: boolean;
      logoUrl: string | null;
    }>;
  }>;
};
