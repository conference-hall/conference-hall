import type { UserPermissions as Permissions } from '~/.server/team/user-permissions.ts';

export type UserPermissions = Permissions;

export type TeamRole = 'OWNER' | 'MEMBER' | 'REVIEWER';
