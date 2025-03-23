import { db } from 'prisma/db.server.ts';
import { sendVerificationEmail } from '~/emails/templates/auth/email-verification.tsx';
import { sendResetPasswordEmail } from '~/emails/templates/auth/reset-password.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { appUrl } from '~/libs/env/env.server.ts';
import { auth as firebaseAuth } from '../../libs/auth/firebase.server.ts';

type UserAccountCreateInput = {
  uid: string;
  name: string;
  email?: string;
  picture?: string;
};

export class UserAccount {
  static async register(data: UserAccountCreateInput) {
    const user = await db.user.findFirst({ where: { uid: data.uid } });
    if (user?.uid) return user.id;

    const { uid, name = '(No name)', email = `${data.uid}@example.com`, picture } = data;
    const newUser = await db.user.create({ data: { name, email, picture, uid: uid } });

    return newUser.id;
  }

  static async linkEmailProvider(uid: string, email: string, password: string) {
    try {
      await firebaseAuth.updateUser(uid, { email, password, emailVerified: false });
      await UserAccount.checkEmailVerification(email, false, 'password');
    } catch (error) {
      console.error('linkEmailProvider', error);
      return getFirebaseError(error);
    }
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
      console.error('sendResetPasswordEmail', error);
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
      console.error('checkEmailVerification', error);
      return false;
    }
  }
}
