import { TeamRole } from '@prisma/client';

export type UserPermissions = {
  canAccessTeam: boolean;
  canEditTeam: boolean;
  canDeleteTeam: boolean;
  canManageTeamMembers: boolean;
  canLeaveTeam: boolean;
  canAccessEvent: boolean;
  canCreateEvent: boolean;
  canEditEvent: boolean;
  canDeleteEvent: boolean;
  canCreateEventProposal: boolean;
  canEditEventProposals: boolean;
  canExportEventProposals: boolean;
  canChangeProposalStatus: boolean;
  canPublishEventResults: boolean;
  canEditEventSchedule: boolean;
};

export type Permission = keyof UserPermissions;

const TEAM_OWNER_PERMISSIONS: UserPermissions = {
  canAccessTeam: true,
  canEditTeam: true,
  canDeleteTeam: true,
  canManageTeamMembers: true,
  canLeaveTeam: false,
  canCreateEvent: true,
  canAccessEvent: true,
  canEditEvent: true,
  canDeleteEvent: true,
  canCreateEventProposal: true,
  canEditEventProposals: true,
  canExportEventProposals: true,
  canChangeProposalStatus: true,
  canPublishEventResults: true,
  canEditEventSchedule: true,
};

const TEAM_MEMBER_PERMISSIONS: UserPermissions = {
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
  canEditEventProposals: true,
  canExportEventProposals: false,
  canChangeProposalStatus: true,
  canPublishEventResults: true,
  canEditEventSchedule: true,
};

const TEAM_REVIEWER_PERMISSIONS: UserPermissions = {
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
  canEditEventProposals: false,
  canExportEventProposals: false,
  canChangeProposalStatus: false,
  canPublishEventResults: false,
  canEditEventSchedule: false,
};

function getPermissions(teamRole: TeamRole) {
  switch (teamRole) {
    case TeamRole.OWNER:
      return TEAM_OWNER_PERMISSIONS;
    case TeamRole.MEMBER:
      return TEAM_MEMBER_PERMISSIONS;
    case TeamRole.REVIEWER:
      return TEAM_REVIEWER_PERMISSIONS;
  }
}

function getRoleWith(permission: Permission) {
  const roles: Array<TeamRole> = [];
  if (TEAM_OWNER_PERMISSIONS[permission]) roles.push(TeamRole.OWNER);
  if (TEAM_MEMBER_PERMISSIONS[permission]) roles.push(TeamRole.MEMBER);
  if (TEAM_REVIEWER_PERMISSIONS[permission]) roles.push(TeamRole.REVIEWER);
  return roles;
}

export const UserPermissions = { getPermissions, getRoleWith };
