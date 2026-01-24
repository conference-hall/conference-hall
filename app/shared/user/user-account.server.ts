import { Notifications } from '~/features/notifications/services/notifications.server.ts';
import { TeamBetaAccess } from '~/features/team-management/creation/services/team-beta-access.server.ts';
import { auth as firebaseAuth } from '~/shared/authentication/firebase.server.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import AccountDeletedEmail from '~/shared/emails/templates/auth/account-deleted.tsx';
import { db } from '../../../prisma/db.server.ts';
import { NotAuthorizedError } from '../errors.server.ts';
import type { AuthenticatedUser } from '../types/user.types.ts';
import { sortBy } from '../utils/arrays-sort-by.ts';

// todo(auth): dont make it static, constructor with userId ?
export class UserAccount {
  // todo(auth): add tests
  static async getById(userId?: string): Promise<AuthenticatedUser | null> {
    if (!userId) return null;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const teams = await UserAccount.teams(user.id);
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

  // todo(auth): add tests
  static async getAccounts(userId: string) {
    const accounts = await db.account.findMany({ where: { userId } });
    return accounts.map((account) => ({ providerId: account.providerId, accountId: account.accountId }));
  }

  static async teams(userId: string) {
    const teamsMembership = await db.teamMember.findMany({
      where: { memberId: userId },
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

  static async changeLocale(userId: string, locale: string) {
    const user = await db.user.update({ where: { id: userId }, data: { locale } });
    await db.eventSpeaker.updateMany({ where: { userId }, data: { locale } });
    return user;
  }

  static async deleteAccount(userId: string, locale: string, sendConfirmationEmail = true) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotAuthorizedError();

    const { uid, email } = user;
    const deletedAt = new Date();

    await db.$transaction(async (tx) => {
      // Anonymize User table
      await tx.user.update({
        where: { id: userId },
        data: {
          uid: null,
          name: 'Deleted user',
          email: `deleted-${userId}@conference-hall.io`,
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

      // Delete accounts
      await tx.account.deleteMany({ where: { userId } });

      // Delete accounts
      await tx.session.deleteMany({ where: { userId } });

      // Delete TeamMember records
      await tx.teamMember.deleteMany({ where: { memberId: userId } });

      // Delete Survey records
      await tx.survey.deleteMany({ where: { userId } });

      // Anonymize EventSpeaker records
      await tx.eventSpeaker.updateMany({
        where: { userId },
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

      // After successful transaction, delete user from Firebase Auth
      try {
        if (uid) await firebaseAuth.deleteUser(uid);
      } catch {
        console.warn(`Unable to delete Firebase user for uid ${uid}.`);
      }
    });

    // Send confirmation email after successful deletion (if requested)
    if (sendConfirmationEmail) {
      const deletionDate = deletedAt.toISOString().split('T')[0];
      await sendEmail.trigger(AccountDeletedEmail.buildPayload(email, locale, { deletionDate }));
    }
  }
}
