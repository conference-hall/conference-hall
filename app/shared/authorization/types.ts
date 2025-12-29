import type { EventType } from '../types/events.types.ts';

export type TeamRole = 'OWNER' | 'MEMBER' | 'REVIEWER';

export type TeamPermissions = {
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

export type AuthorizedTeam = {
  userId: string;
  teamId: string;
  role: TeamRole;
  permissions: TeamPermissions;
};

export type AuthorizedEvent = AuthorizedTeam & { eventId: string; eventType: EventType };
