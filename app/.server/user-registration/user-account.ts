import { db } from 'prisma/db.server.ts';
import { sendVerificationEmail } from '~/emails/templates/auth/email-verification.tsx';
import { sendResetPasswordEmail } from '~/emails/templates/auth/reset-password.tsx';
import { appUrl } from '~/libs/env/env.server.ts';
import { auth as firebaseAuth } from '../../libs/auth/firebase.server.ts';

type UserAccountCreateInput = {
  uid: string;
  name: string;
  email?: string;
  emailVerified?: boolean;
  picture?: string;
  provider: string;
};

export class UserAccount {
  static async register(data: UserAccountCreateInput) {
    const authentication = await db.authenticationMethod.findUnique({
      where: { uid: data.uid },
      include: { user: true },
    });

    if (authentication) return authentication.user.id;

    const { uid, name = '(No name)', email = `${data.uid}@example.com`, picture, provider = 'unknown' } = data;

    const newAuthentication = await db.authenticationMethod.create({
      data: {
        uid: uid,
        name,
        email,
        picture,
        provider,
        user: { create: { name, email, picture, uid } },
      },
      include: { user: true },
    });

    return newAuthentication.user.id;
  }

  static async sendResetPasswordEmail(email: string) {
    try {
      const firebaseResetLink = await firebaseAuth.generatePasswordResetLink(email);
      const firebaseResetUrl = new URL(firebaseResetLink);
      const oobCode = firebaseResetUrl.searchParams.get('oobCode');

      if (!oobCode) return;

      const passwordResetUrl = new URL(`${appUrl()}/auth/reset-password`);
      passwordResetUrl.searchParams.set('oobCode', oobCode);
      passwordResetUrl.searchParams.set('email', email);

      await sendResetPasswordEmail({ email, passwordResetUrl: passwordResetUrl.toString() });
    } catch (error) {
      console.error(error);
    }
  }

  static async checkEmailVerification(email: string | undefined, emailVerified: boolean | undefined, provider: string) {
    if (!email) return false;
    if (emailVerified) return false;
    if (provider !== 'password') return false;

    try {
      const firebaseVerificationLink = await firebaseAuth.generateEmailVerificationLink(email);
      const firebaseVerificationUrl = new URL(firebaseVerificationLink);
      const oobCode = firebaseVerificationUrl.searchParams.get('oobCode');

      if (!oobCode) return false;

      const emailVerificationUrl = new URL(`${appUrl()}/auth/verify-email`);
      emailVerificationUrl.searchParams.set('oobCode', oobCode);
      emailVerificationUrl.searchParams.set('email', email);

      await sendVerificationEmail({ email, emailVerificationUrl: emailVerificationUrl.toString() });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
