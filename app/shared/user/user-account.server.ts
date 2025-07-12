import type { TFunction } from 'i18next';
import { db } from 'prisma/db.server.ts';
import { getSharedServerEnv } from 'servers/environment.server.ts';
import { Notifications } from '~/features/notifications/services/notifications.server.ts';
import { TeamBetaAccess } from '~/features/team-management/creation/services/team-beta-access.server.ts';
import { getFirebaseError } from '~/shared/auth/firebase.errors.ts';
import { auth as firebaseAuth } from '~/shared/auth/firebase.server.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import VerificationEmail from '~/shared/emails/templates/auth/email-verification.tsx';
import ResetPasswordEmail from '~/shared/emails/templates/auth/reset-password.tsx';
import { NotAuthorizedError } from '../errors.server.ts';
import { sortBy } from '../utils/arrays-sort-by.ts';

const { APP_URL } = getSharedServerEnv();

type UserAccountRegisterInput = {
  uid: string;
  name: string;
  email?: string;
  picture?: string;
  locale: string;
};

export class UserAccount {
  static async get(userId: string | undefined) {
    if (!userId) return null;

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    const teams = await UserAccount.teams(userId);
    const hasTeamAccess = TeamBetaAccess.hasAccess(user, teams.length);
    const notificationsUnreadCount = await Notifications.for(user.id).unreadCount();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      notificationsUnreadCount,
      hasTeamAccess,
      teams,
    };
  }

  static async teams(userId: string) {
    const teamsMembership = await db.teamMember.findMany({
      where: { memberId: userId },
      include: { team: { include: { events: true } } },
    });

    const teams = teamsMembership.map(({ team }) => {
      const events = team.events.map((event) => ({
        slug: event.slug,
        name: event.name,
        archived: event.archived,
        logoUrl: event.logoUrl,
      }));
      return { slug: team.slug, name: team.name, events: sortBy(events, 'name') };
    });

    return sortBy(teams, 'name');
  }

  static async register(data: UserAccountRegisterInput) {
    const user = await db.user.findFirst({ where: { uid: data.uid } });

    if (user?.uid) {
      if (user.locale !== data.locale) {
        await UserAccount.changeLocale(user.id, data.locale);
      }
      return user.id;
    }

    const { uid, name = '(No name)', email = `${data.uid}@example.com`, picture, locale } = data;
    const newUser = await db.user.create({ data: { name, email, picture, uid, locale } });

    return newUser.id;
  }

  static async changeLocale(userId: string, locale: string) {
    const user = await db.user.update({ where: { id: userId }, data: { locale } });
    await db.eventSpeaker.updateMany({ where: { userId }, data: { locale } });
    return user;
  }

  static async linkEmailProvider(uid: string, email: string, password: string, locale: string, t: TFunction) {
    try {
      await firebaseAuth.updateUser(uid, { email, password, emailVerified: false });
      await UserAccount.checkEmailVerification(email, false, 'password', locale);
    } catch (error) {
      console.warn('linkEmailProvider', error);
      return getFirebaseError(error, t);
    }
  }

  static async sendResetPasswordEmail(email: string, locale: string) {
    try {
      const firebaseResetLink = await firebaseAuth.generatePasswordResetLink(email);
      const firebaseResetUrl = new URL(firebaseResetLink);
      const oobCode = firebaseResetUrl.searchParams.get('oobCode');

      if (!oobCode) return;

      const passwordResetUrl = new URL(`${APP_URL}/auth/reset-password`);
      passwordResetUrl.searchParams.set('oobCode', oobCode);
      passwordResetUrl.searchParams.set('email', email);

      await sendEmail.trigger(
        ResetPasswordEmail.buildPayload(email, locale, {
          passwordResetUrl: passwordResetUrl.toString(),
        }),
      );
    } catch (error) {
      console.warn('sendResetPasswordEmail', error);
    }
  }

  static async checkEmailVerification(
    email: string | undefined,
    emailVerified: boolean | undefined,
    provider: string,
    locale: string,
  ) {
    if (!email) return false;
    if (emailVerified) return false;
    if (provider !== 'password') return false;

    try {
      const firebaseVerificationLink = await firebaseAuth.generateEmailVerificationLink(email);
      const firebaseVerificationUrl = new URL(firebaseVerificationLink);
      const oobCode = firebaseVerificationUrl.searchParams.get('oobCode');

      if (!oobCode) return false;

      const emailVerificationUrl = new URL(`${APP_URL}/auth/verify-email`);
      emailVerificationUrl.searchParams.set('oobCode', oobCode);
      emailVerificationUrl.searchParams.set('email', email);

      await sendEmail.trigger(
        VerificationEmail.buildPayload(email, locale, {
          emailVerificationUrl: emailVerificationUrl.toString(),
        }),
      );

      return true;
    } catch (error) {
      console.warn('checkEmailVerification', error);
      return false;
    }
  }

  static async needsAdminRole(userId: string) {
    const user = await db.user.findUnique({ where: { id: userId, admin: true } });
    if (!user) {
      throw new NotAuthorizedError();
    }
  }
}
