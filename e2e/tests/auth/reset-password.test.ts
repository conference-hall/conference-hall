import { userFactory } from 'tests/factories/users.ts';
import { MailBox } from '../../common/mailbox.page.ts';
import { expect, resetMailbox, test } from '../../fixtures.ts';
import { HomePage } from '../event-search/home.page.ts';
import { LoginPage } from './login.page.ts';
import { ForgotPasswordPage, ResetPasswordPage } from './reset-password.page.ts';

test.beforeEach(async () => {
  await resetMailbox();
});

test('Reset password flow with email and password', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'], withPasswordAccount: true });

  const loginPage = new LoginPage(page);
  const forgotPasswordPage = new ForgotPasswordPage(page);
  const resetPasswordPage = new ResetPasswordPage(page);
  const homePage = new HomePage(page);
  const mailbox = new MailBox(page);
  const newPassword = 'NewPassword456';

  await loginPage.goto();
  await loginPage.forgotPasswordLink.click();

  await forgotPasswordPage.waitFor();
  await forgotPasswordPage.waitForCaptcha();
  await forgotPasswordPage.emailInput.fill(user.email);
  await forgotPasswordPage.sendResetEmailButton.click();
  await forgotPasswordPage.emailSentHeading.waitFor();
  await expect(page.getByText('Please check your inbox.')).toBeVisible();

  await mailbox.goto();
  await mailbox.waitForEmail('Set your password for Conference Hall');
  const resetPasswordLink = await mailbox.emailContent
    .getByRole('link', { name: 'Set your password' })
    .getAttribute('href');

  await page.goto(resetPasswordLink || '');
  await resetPasswordPage.waitFor();
  await resetPasswordPage.passwordInput.fill(newPassword);
  await resetPasswordPage.resetPasswordButton.click();

  await loginPage.waitFor();
  await loginPage.waitForCaptcha();
  await loginPage.signInWithPassword(user.email, newPassword);
  await homePage.waitFor();
});
