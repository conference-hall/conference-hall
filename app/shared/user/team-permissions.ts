export type TeamRole = 'OWNER' | 'MEMBER' | 'REVIEWER';

type TeamPermissions = {
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
  canCreateEventSpeaker: boolean;
  canEditEventSpeaker: boolean;
  canEditEventProposal: boolean;
  canManageConversations: boolean;
  canExportEventProposals: boolean;
  canChangeProposalStatus: boolean;
  canPublishEventResults: boolean;
  canEditEventSchedule: boolean;
};

export type TeamPermission = keyof TeamPermissions;

const TEAM_OWNER_PERMISSIONS: TeamPermissions = {
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
  canCreateEventSpeaker: true,
  canEditEventSpeaker: true,
  canEditEventProposal: true,
  canManageConversations: true,
  canExportEventProposals: true,
  canChangeProposalStatus: true,
  canPublishEventResults: true,
  canEditEventSchedule: true,
};

const TEAM_MEMBER_PERMISSIONS: TeamPermissions = {
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
};

const TEAM_REVIEWER_PERMISSIONS: TeamPermissions = {
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
};

const NO_PERMISSIONS: TeamPermissions = {
  canAccessTeam: false,
  canEditTeam: false,
  canDeleteTeam: false,
  canManageTeamMembers: false,
  canLeaveTeam: false,
  canAccessEvent: false,
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
};

function getPermissions(teamRole?: TeamRole) {
  switch (teamRole) {
    case 'OWNER':
      return TEAM_OWNER_PERMISSIONS;
    case 'MEMBER':
      return TEAM_MEMBER_PERMISSIONS;
    case 'REVIEWER':
      return TEAM_REVIEWER_PERMISSIONS;
    default:
      return NO_PERMISSIONS;
  }
}

function getRoleWith(permission: TeamPermission) {
  const roles: Array<TeamRole> = [];
  if (TEAM_OWNER_PERMISSIONS[permission]) roles.push('OWNER');
  if (TEAM_MEMBER_PERMISSIONS[permission]) roles.push('MEMBER');
  if (TEAM_REVIEWER_PERMISSIONS[permission]) roles.push('REVIEWER');
  return roles;
}

export const UserTeamPermissions = { getPermissions, getRoleWith };
