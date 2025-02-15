import { TeamRole } from '@prisma/client';

import { UserPermissions } from './user-permissions.ts';

describe('UserPermissions', () => {
  describe('#getPermissions', () => {
    it('returns owner permissions', async () => {
      const permissions = UserPermissions.getPermissions(TeamRole.OWNER);

      expect(permissions).toEqual({
        canAccessTeam: true,
        canEditTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canEditEventProposals: true,
        canExportEventProposals: true,
        canDeliberateEventProposals: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      });
    });

    it('returns member permissions', async () => {
      const permissions = UserPermissions.getPermissions(TeamRole.MEMBER);

      expect(permissions).toEqual({
        canAccessTeam: true,
        canEditTeam: false,
        canManageTeamMembers: false,
        canLeaveTeam: true,
        canAccessEvent: true,
        canCreateEvent: false,
        canEditEvent: true,
        canEditEventProposals: true,
        canExportEventProposals: false,
        canDeliberateEventProposals: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      });
    });

    it('returns member permissions', async () => {
      const permissions = UserPermissions.getPermissions(TeamRole.REVIEWER);

      expect(permissions).toEqual({
        canAccessTeam: true,
        canEditTeam: false,
        canManageTeamMembers: false,
        canLeaveTeam: true,
        canAccessEvent: true,
        canCreateEvent: false,
        canEditEvent: false,
        canEditEventProposals: false,
        canExportEventProposals: false,
        canDeliberateEventProposals: false,
        canPublishEventResults: false,
        canEditEventSchedule: false,
      });
    });
  });

  describe('#getRoleWith', () => {
    it('returns roles for a permission with all roles', async () => {
      const permissions = UserPermissions.getRoleWith('canAccessEvent');

      expect(permissions).toEqual([TeamRole.OWNER, TeamRole.MEMBER, TeamRole.REVIEWER]);
    });

    it('returns roles for a permission with some roles', async () => {
      const permissions = UserPermissions.getRoleWith('canEditTeam');

      expect(permissions).toEqual([TeamRole.OWNER]);
    });
  });
});
