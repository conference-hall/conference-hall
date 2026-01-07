import type { Event } from 'prisma/generated/client.ts';

export type AuthorizedAdmin = { id: string };

export type TeamRole = 'OWNER' | 'MEMBER' | 'REVIEWER';

export type TeamPermissions = {
  readonly canAccessTeam: boolean;
  readonly canEditTeam: boolean;
  readonly canDeleteTeam: boolean;
  readonly canManageTeamMembers: boolean;
  readonly canLeaveTeam: boolean;
  readonly canAccessEvent: boolean;
  readonly canCreateEvent: boolean;
  readonly canEditEvent: boolean;
  readonly canDeleteEvent: boolean;
  readonly canCreateEventProposal: boolean;
  readonly canCreateEventSpeaker: boolean;
  readonly canEditEventSpeaker: boolean;
  readonly canEditEventProposal: boolean;
  readonly canManageConversations: boolean;
  readonly canExportEventProposals: boolean;
  readonly canChangeProposalStatus: boolean;
  readonly canPublishEventResults: boolean;
  readonly canEditEventSchedule: boolean;
};

export type TeamPermission = keyof TeamPermissions;

export type AuthorizedTeam = {
  readonly userId: string;
  readonly teamId: string;
  readonly role: TeamRole;
  readonly permissions: TeamPermissions;
};

export type AuthorizedEvent = AuthorizedTeam & { readonly event: Event };

export type AuthorizedApiEvent = { readonly event: Event };
