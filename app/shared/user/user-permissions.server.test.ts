import { TeamRole } from '@prisma/client';

import { UserPermissions } from './user-permissions.server.ts';

describe('UserPermissions', () => {
  describe('#getPermissions', () => {
    it('returns owner permissions', async () => {
      const permissions = UserPermissions.getPermissions(TeamRole.OWNER);

      expect(permissions).toEqual({
        canAccessTeam: true,
        canEditTeam: true,
        canDeleteTeam: true,
        canManageTeamMembers: true,
        canLeaveTeam: false,
        canAccessEvent: true,
        canCreateEvent: true,
        canEditEvent: true,
        canDeleteEvent: true,
        canEditEventProposals: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      });
    });

    it('returns member permissions', async () => {
      const permissions = UserPermissions.getPermissions(TeamRole.MEMBER);

      expect(permissions).toEqual({
        canAccessTeam: true,
        canEditTeam: false,
        canDeleteTeam: false,
        canManageTeamMembers: false,
        canLeaveTeam: true,
        canAccessEvent: true,
        canCreateEvent: false,
        canEditEvent: true,
        canDeleteEvent: false,
        canEditEventProposals: true,
        canExportEventProposals: false,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      });
    });

    it('returns member permissions', async () => {
      const permissions = UserPermissions.getPermissions(TeamRole.REVIEWER);

      expect(permissions).toEqual({
        canAccessTeam: true,
        canEditTeam: false,
        canDeleteTeam: false,
        canManageTeamMembers: false,
        canLeaveTeam: true,
        canAccessEvent: true,
        canCreateEvent: false,
        canEditEvent: false,
        canDeleteEvent: false,
        canEditEventProposals: false,
        canExportEventProposals: false,
        canChangeProposalStatus: false,
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
