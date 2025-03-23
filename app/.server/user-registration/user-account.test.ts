import { AuthClientErrorCode } from 'firebase-admin/auth';
import { FirebaseError } from 'firebase/app';
import { db } from 'prisma/db.server.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { sendEmail } from '~/emails/send-email.job.ts';
import { auth } from '../../libs/auth/firebase.server.ts';
import { UserAccount } from './user-account.ts';

vi.mock('../../libs/auth/firebase.server.ts', () => ({
  auth: { updateUser: vi.fn(), generatePasswordResetLink: vi.fn(), generateEmailVerificationLink: vi.fn() },
}));

describe('UserAccount', () => {
  describe('register', () => {
    it('register a new user if doesnt exists', async () => {
      const userId = await UserAccount.register({
        uid: '123',
        name: 'Bob',
        email: 'bob@example.com',
        picture: 'https://image.com/image.png',
      });

      const user = await db.user.findFirst({ where: { id: userId } });
      expect(user?.uid).toEqual('123');
      expect(user?.name).toEqual('Bob');
      expect(user?.email).toEqual('bob@example.com');
      expect(user?.picture).toEqual('https://image.com/image.png');
      expect(user?.termsAccepted).toEqual(false);
    });

    it('register a new user with some default values', async () => {
      const userId = await UserAccount.register({
        uid: '123',
        name: 'Bob',
      });

      const user = await db.user.findFirst({ where: { id: userId } });
      expect(user?.uid).toEqual('123');
      expect(user?.name).toEqual('Bob');
      expect(user?.email).toEqual('123@example.com');
      expect(user?.picture).toBe(null);
      expect(user?.termsAccepted).toEqual(false);
    });

    it('returns existing user id if already exists', async () => {
      const user = await userFactory({ traits: ['clark-kent'] });

      if (!user.uid) throw new Error('Account not found');

      const userId = await UserAccount.register({
        uid: user.uid,
        name: 'Bob',
        email: 'bob@example.com',
        picture: 'https://image.com/image.png',
      });

      expect(userId).toEqual(user.id);
    });
  });

  describe('linkEmailProvider', () => {
    it('links email provider and sends the verification email', async () => {
      const updateUserMock = auth.updateUser as Mock;
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;
      generateEmailVerificationLinkMock.mockResolvedValue('https://firebase.app/verification-link?oobCode=my-code');

      await UserAccount.linkEmailProvider('uid123', 'foo@example.com', 'password');

      expect(updateUserMock).toHaveBeenCalledWith('uid123', {
        email: 'foo@example.com',
        password: 'password',
        providerToLink: { uid: 'uid123', email: 'foo@example.com', providerId: 'password' },
      });

      expect(generateEmailVerificationLinkMock).toHaveBeenCalledWith('foo@example.com');
      expect(sendEmail.trigger).toHaveBeenCalledWith({
        template: 'auth/email-verification',
        from: 'Conference Hall <no-reply@mg.conference-hall.io>',
        to: ['foo@example.com'],
        subject: 'Verify your email address for Conference Hall',
        data: {
          email: 'foo@example.com',
          emailVerificationUrl: 'http://127.0.0.1:3000/auth/verify-email?oobCode=my-code&email=foo%40example.com',
        },
      });
    });

    it('returns an error when email already exists', async () => {
      const updateUserMock = auth.updateUser as Mock;
      const { code, message } = AuthClientErrorCode.EMAIL_ALREADY_EXISTS;
      updateUserMock.mockRejectedValue(new FirebaseError(`auth/${code}`, message));
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;

      const error = await UserAccount.linkEmailProvider('uid123', 'foo@example.com', 'password');

      expect(error).toEqual('Email or password is incorrect.');
      expect(generateEmailVerificationLinkMock).not.toHaveBeenCalled();
      expect(sendEmail.trigger).not.toHaveBeenCalled();
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
      generateEmailVerificationLinkMock.mockResolvedValue('https://firebase.app/verification-link?oobCode=my-code');

      const needVerification = await UserAccount.checkEmailVerification('foo@example.com', false, 'password');

      expect(needVerification).toEqual(true);
      expect(generateEmailVerificationLinkMock).toHaveBeenCalledWith('foo@example.com');
      expect(sendEmail.trigger).toHaveBeenCalledWith({
        template: 'auth/email-verification',
        from: 'Conference Hall <no-reply@mg.conference-hall.io>',
        to: ['foo@example.com'],
        subject: 'Verify your email address for Conference Hall',
        data: {
          email: 'foo@example.com',
          emailVerificationUrl: 'http://127.0.0.1:3000/auth/verify-email?oobCode=my-code&email=foo%40example.com',
        },
      });
    });

    it('returns false when no email', async () => {
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;

      const needVerification = await UserAccount.checkEmailVerification(undefined, false, 'password');

      expect(needVerification).toEqual(false);
      expect(generateEmailVerificationLinkMock).not.toHaveBeenCalled();
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });

    it('returns false when no email is verified', async () => {
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;

      const needVerification = await UserAccount.checkEmailVerification('foo@example.com', true, 'password');

      expect(needVerification).toEqual(false);
      expect(generateEmailVerificationLinkMock).not.toHaveBeenCalled();
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });

    it('returns false when auth provider is not password', async () => {
      const generateEmailVerificationLinkMock = auth.generateEmailVerificationLink as Mock;

      const needVerification = await UserAccount.checkEmailVerification('foo@example.com', false, 'google.com');

      expect(needVerification).toEqual(false);
      expect(generateEmailVerificationLinkMock).not.toHaveBeenCalled();
      expect(sendEmail.trigger).not.toHaveBeenCalled();
    });
  });
});
