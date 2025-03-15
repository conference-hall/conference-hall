import { db } from 'prisma/db.server.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { sendEmail } from '~/emails/send-email.job.ts';
import { auth } from '../../libs/auth/firebase.server.ts';
import { UserAccount } from './user-account.ts';

vi.mock('../../libs/auth/firebase.server.ts', () => ({
  auth: { generatePasswordResetLink: vi.fn(), generateEmailVerificationLink: vi.fn() },
}));

describe('UserAccount', () => {
  describe('register', () => {
    it('register a new user if doesnt exists', async () => {
      const userId = await UserAccount.register({
        uid: '123',
        name: 'Bob',
        email: 'bob@example.com',
        emailVerified: true,
        picture: 'https://image.com/image.png',
        provider: 'google.com',
      });

      const user = await db.user.findFirst({ where: { id: userId }, include: { authenticationMethods: true } });
      expect(user?.name).toEqual('Bob');
      expect(user?.email).toEqual('bob@example.com');
      expect(user?.emailVerified).toEqual(true);
      expect(user?.termsAccepted).toEqual(false);
      expect(user?.picture).toEqual('https://image.com/image.png');
      expect(user?.authenticationMethods[0].uid).toEqual('123');
      expect(user?.authenticationMethods[0].name).toEqual('Bob');
      expect(user?.authenticationMethods[0].email).toEqual('bob@example.com');
      expect(user?.authenticationMethods[0].picture).toEqual('https://image.com/image.png');
      expect(user?.authenticationMethods[0].provider).toEqual('google.com');
    });

    it('register a new user with some default values', async () => {
      const userId = await UserAccount.register({
        uid: '123',
        name: 'Bob',
        provider: 'google.com',
      });

      const user = await db.user.findFirst({ where: { id: userId }, include: { authenticationMethods: true } });
      expect(user?.name).toEqual('Bob');
      expect(user?.email).toEqual('123@example.com');
      expect(user?.emailVerified).toEqual(false);
      expect(user?.termsAccepted).toEqual(false);
      expect(user?.picture).toBe(null);
      expect(user?.authenticationMethods[0].uid).toEqual('123');
      expect(user?.authenticationMethods[0].name).toEqual('Bob');
      expect(user?.authenticationMethods[0].email).toEqual('123@example.com');
      expect(user?.authenticationMethods[0].picture).toBe(null);
      expect(user?.authenticationMethods[0].provider).toEqual('google.com');
    });

    it('returns existing user id if already exists', async () => {
      const user = await userFactory();
      const account = await db.authenticationMethod.findFirst({ where: { userId: user.id } });

      if (!account) throw new Error('Account not found');

      const userId = await UserAccount.register({
        uid: account.uid,
        name: 'Bob',
        email: 'bob@example.com',
        picture: 'https://image.com/image.png',
        provider: 'google.com',
      });

      expect(userId).toEqual(user.id);
    });
  });

  describe('sendResetPasswordEmail', () => {
    it('sends a reset password email', async () => {
      const generatePasswordResetLinkMock = auth.generatePasswordResetLink as Mock;
      generatePasswordResetLinkMock.mockResolvedValue('https://firebase.app/auth?mode=resetPassword&oobCode=my-code');

      await UserAccount.sendResetPasswordEmail('foo@example.com');

      expect(generatePasswordResetLinkMock).toHaveBeenCalledWith('foo@example.com');
      expect(sendEmail.trigger).toHaveBeenCalledWith({
        template: 'auth/reset-password',
        from: 'Conference Hall <no-reply@mg.conference-hall.io>',
        to: ['foo@example.com'],
        subject: 'Reset your password for Conference Hall',
        data: {
          email: 'foo@example.com',
          passwordResetUrl: 'http://127.0.0.1:3000/auth/reset-password?oobCode=my-code&email=foo%40example.com',
        },
      });
    });

    it('does nothing if no oobCode returned by firebase', async () => {
      const generatePasswordResetLinkMock = auth.generatePasswordResetLink as Mock;
      generatePasswordResetLinkMock.mockResolvedValue('https://firebase.app/auth?mode=resetPassword');

      await UserAccount.sendResetPasswordEmail('foo@example.com');

      expect(generatePasswordResetLinkMock).toHaveBeenCalledWith('foo@example.com');
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });

    it('does nothing if firebase fails to generate the email link (eg. if account does not exist)', async () => {
      const generatePasswordResetLinkMock = auth.generatePasswordResetLink as Mock;
      generatePasswordResetLinkMock.mockRejectedValue('User account does not exist');

      await UserAccount.sendResetPasswordEmail('foo@example.com');

      expect(generatePasswordResetLinkMock).toHaveBeenCalledWith('foo@example.com');
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });
  });

  describe('checkEmailVerification', () => {
    it('returns true and sends the verification email', async () => {
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;
      generateEmailVerificationLinkMock.mockResolvedValue('https://firebase.app/verification-link');

      const needVerification = await UserAccount.checkEmailVerification({
        email: 'foo@example.com',
        email_verified: false,
        firebase: { sign_in_provider: 'password', identities: {} },
      });

      expect(needVerification).toEqual(true);
      expect(generateEmailVerificationLinkMock).toHaveBeenCalledWith('foo@example.com', {
        url: 'http://127.0.0.1:3000/auth/login?email=foo@example.com',
      });
      expect(sendEmail.trigger).toHaveBeenCalledWith({
        template: 'auth/email-verification',
        from: 'Conference Hall <no-reply@mg.conference-hall.io>',
        to: ['foo@example.com'],
        subject: 'Verify your email address for Conference Hall',
        data: {
          email: 'foo@example.com',
          emailVerificationUrl: 'https://firebase.app/verification-link',
        },
      });
    });

    it('returns false when no email', async () => {
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;

      const needVerification = await UserAccount.checkEmailVerification({
        email_verified: false,
        firebase: { sign_in_provider: 'password', identities: {} },
      });

      expect(needVerification).toEqual(false);
      expect(generateEmailVerificationLinkMock).not.toHaveBeenCalled();
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });

    it('returns false when no email is verified', async () => {
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;

      const needVerification = await UserAccount.checkEmailVerification({
        email: 'foo@example.com',
        email_verified: true,
        firebase: { sign_in_provider: 'password', identities: {} },
      });

      expect(needVerification).toEqual(false);
      expect(generateEmailVerificationLinkMock).not.toHaveBeenCalled();
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });

    it('returns false when auth provider is not password', async () => {
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;

      const needVerification = await UserAccount.checkEmailVerification({
        email: 'foo@example.com',
        email_verified: false,
        firebase: { sign_in_provider: 'google.com', identities: {} },
      });

      expect(needVerification).toEqual(false);
      expect(generateEmailVerificationLinkMock).not.toHaveBeenCalled();
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });
  });
});
