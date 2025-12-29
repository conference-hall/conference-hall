import { TeamRole } from 'prisma/generated/client.ts';
import { UserTeamPermissions } from '../authorization/team-permissions.ts';

describe('UserTeamPermissions', () => {
  describe('#getPermissions', () => {
    it('returns owner permissions', async () => {
      const permissions = UserTeamPermissions.getPermissions(TeamRole.OWNER);

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
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: true,
        canExportEventProposals: true,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      });
    });

    it('returns member permissions', async () => {
      const permissions = UserTeamPermissions.getPermissions(TeamRole.MEMBER);

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
        canCreateEventProposal: true,
        canCreateEventSpeaker: true,
        canEditEventSpeaker: true,
        canEditEventProposal: true,
        canManageConversations: false,
        canExportEventProposals: false,
        canChangeProposalStatus: true,
        canPublishEventResults: true,
        canEditEventSchedule: true,
      });
    });

    it('returns reviewer permissions', async () => {
      const permissions = UserTeamPermissions.getPermissions(TeamRole.REVIEWER);

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
        canCreateEventProposal: false,
        canCreateEventSpeaker: false,
        canEditEventSpeaker: false,
        canEditEventProposal: false,
        canManageConversations: false,
        canExportEventProposals: false,
        canChangeProposalStatus: false,
        canPublishEventResults: false,
        canEditEventSchedule: false,
      });
    });
  });

  describe('#getRoleWith', () => {
    it('returns roles for a permission with all roles', async () => {
      const permissions = UserTeamPermissions.getRoleWith('canAccessEvent');

      expect(permissions).toEqual([TeamRole.OWNER, TeamRole.MEMBER, TeamRole.REVIEWER]);
    });

    it('returns roles for a permission with some roles', async () => {
      const permissions = UserTeamPermissions.getRoleWith('canEditTeam');

      expect(permissions).toEqual([TeamRole.OWNER]);
    });
  });
});
