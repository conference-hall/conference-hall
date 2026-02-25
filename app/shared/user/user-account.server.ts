import { Notifications } from '~/features/notifications/services/notifications.server.ts';
import { TeamBetaAccess } from '~/features/team-management/creation/services/team-beta-access.server.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import AccountDeletedEmail from '~/shared/emails/templates/auth/account-deleted.tsx';
import { db } from '../../../prisma/db.server.ts';
import { UserNotFoundError } from '../errors.server.ts';
import type { AuthenticatedUser } from '../types/user.types.ts';
import { sortBy } from '../utils/arrays-sort-by.ts';

type DeleteAccountOptions = { sendConfirmationEmail: boolean };

export class UserAccount {
  constructor(private userId: string) {}

  static for(userId: string) {
    return new UserAccount(userId);
  }

  async get(): Promise<AuthenticatedUser | null> {
    const user = await db.user.findUnique({ where: { id: this.userId } });
    if (!user) return null;

    const teams = await this.teams();
    const hasTeamAccess = TeamBetaAccess.hasAccess(user, teams.length);
    const notificationsUnreadCount = await Notifications.for(user.id).unreadCount();

    return {
      id: user.id,
      uid: user.uid,
      name: user.name,
      email: user.email,
      picture: user.picture,
      notificationsUnreadCount,
      hasTeamAccess,
      teams,
    };
  }

  async getAccounts() {
    const accounts = await db.account.findMany({ where: { userId: this.userId } });
    return accounts.map((account) => ({ providerId: account.providerId, accountId: account.accountId }));
  }

  async teams() {
    const teamsMembership = await db.teamMember.findMany({
      where: { memberId: this.userId },
      include: { team: { include: { events: true } } },
    });

    const teams = teamsMembership.map(({ team, role }) => {
      const events = team.events.map((event) => ({
        slug: event.slug,
        name: event.name,
        archived: event.archived,
        logoUrl: event.logoUrl,
      }));
      return {
        slug: team.slug,
        name: team.name,
        role,
        events: sortBy(events, 'name'),
      };
    });

    return sortBy(teams, 'name');
  }

  async changeLocale(locale: string) {
    const user = await db.user.update({ where: { id: this.userId }, data: { locale } });
    await db.eventSpeaker.updateMany({ where: { userId: this.userId }, data: { locale } });
    return user;
  }

  async deleteAccount(options?: DeleteAccountOptions) {
    const user = await db.user.findUnique({ where: { id: this.userId } });
    if (!user) throw new UserNotFoundError();

    const deletedAt = new Date();

    await db.$transaction(async (tx) => {
      // Anonymize User table
      await tx.user.update({
        where: { id: this.userId },
        data: {
          uid: null,
          name: 'Deleted user',
          email: `deleted-${this.userId}@conference-hall.io`,
          bio: null,
          picture: null,
          company: null,
          references: null,
          location: null,
          socialLinks: [],
          deletedAt,
          talks: { set: [] },
        },
      });

      // Delete Accounts
      await tx.account.deleteMany({ where: { userId: this.userId } });

      // Delete Sessions
      await tx.session.deleteMany({ where: { userId: this.userId } });

      // Delete TeamMember records
      await tx.teamMember.deleteMany({ where: { memberId: this.userId } });

      // Delete Survey records
      await tx.survey.deleteMany({ where: { userId: this.userId } });

      // Anonymize EventSpeaker records
      await tx.eventSpeaker.updateMany({
        where: { userId: this.userId },
        data: {
          userId: null,
          email: 'deleted-user-account',
          bio: null,
          picture: null,
          company: null,
          references: null,
          location: null,
          socialLinks: [],
        },
      });
    });

    // Send confirmation email after successful deletion (if requested)
    const sendConfirmationEmail = options?.sendConfirmationEmail ?? true;
    if (sendConfirmationEmail) {
      const deletionDate = deletedAt.toISOString().split('T')[0];
      await sendEmail.trigger(AccountDeletedEmail.buildPayload(user.email, user.locale, { deletionDate }));
    }
  }
}
