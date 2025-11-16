import { db } from '@conference-hall/database';
import { getSharedServerEnv } from '@conference-hall/shared/environment.ts';
import type { TFunction } from 'i18next';
import { Notifications } from '~/features/notifications/services/notifications.server.ts';
import { TeamBetaAccess } from '~/features/team-management/creation/services/team-beta-access.server.ts';
import { getFirebaseError } from '~/shared/auth/firebase.errors.ts';
import { auth as firebaseAuth } from '~/shared/auth/firebase.server.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import AccountDeletedEmail from '~/shared/emails/templates/auth/account-deleted.tsx';
import VerificationEmail from '~/shared/emails/templates/auth/email-verification.tsx';
import ResetPasswordEmail from '~/shared/emails/templates/auth/reset-password.tsx';
import { validateCaptchaToken } from '../auth/captcha.server.ts';
import { NotAuthorizedError } from '../errors.server.ts';
import { flags } from '../feature-flags/flags.server.ts';
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

  static async sendResetPasswordEmail(email: string, locale: string, captchaToken?: string) {
    try {
      // Validate captcha token only if feature is enabled
      const isCaptchaEnabled = await flags.get('captcha');
      if (isCaptchaEnabled) {
        const isCaptchaValid = await validateCaptchaToken(captchaToken);
        if (!isCaptchaValid) {
          throw new Response('Captcha validation failed', { status: 403 });
        }
      }

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

  static async deleteAccount(userId: string, locale: string, sendConfirmationEmail = true) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotAuthorizedError();

    const { uid, email } = user;
    const deletedAt = new Date();

    try {
      await db.$transaction(async (tx) => {
        // Anonymize User table
        await tx.user.update({
          where: { id: userId },
          data: {
            uid: null,
            name: 'Deleted user',
            email: 'deleted-user-account',
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
        if (uid) await firebaseAuth.deleteUser(uid);
      });

      // Send confirmation email after successful deletion (if requested)
      if (sendConfirmationEmail) {
        const deletionDate = deletedAt.toISOString().split('T')[0];
        await sendEmail.trigger(AccountDeletedEmail.buildPayload(email, locale, { deletionDate }));
      }
    } catch (error) {
      console.error('deleteAccount', error);
      throw error;
    }
  }
}
