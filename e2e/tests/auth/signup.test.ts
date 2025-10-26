import { MailBox } from 'e2e/common/mailbox.page.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { expect, resetMailbox, test } from '../../fixtures.ts';
import { HomePage } from '../event-search/home.page.ts';
import { ForgotPasswordPage, LoginPage, ResetPasswordPage } from './login.page.ts';
import { SignupPage } from './signup.page.ts';

test.beforeEach(async () => {
  await resetMailbox();
});

test('Signup flow with email and password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const signupPage = new SignupPage(page);
  const forgotPasswordPage = new ForgotPasswordPage(page);
  const resetPasswordPage = new ResetPasswordPage(page);
  const homePage = new HomePage(page);
  const mailbox = new MailBox(page);
  const uniqueEmail = `john.doe.${Date.now()}@example.com`;

  // go to signup page
  await loginPage.goto();
  await loginPage.signupLink.click();

  // signup
  await signupPage.waitFor();
  await signupPage.fullnameInput.fill('John Doe');
  await signupPage.emailInput.fill(uniqueEmail);
  await signupPage.passwordInput.fill('abc');
  await signupPage.signupButton.click();
  await expect(page.getByText('Minimum 8 characters. Missing uppercase letter. Missing number')).toBeVisible();
  await signupPage.passwordInput.fill('Password123');
  await signupPage.signupButton.click();

  // check email verification
  await signupPage.emailVerificationSent();
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');
  const emailVerificationLink = await mailbox.emailContent
    .getByRole('link', { name: 'Verify your email address' })
    .getAttribute('href');

  // forgot password
  await page.goto(emailVerificationLink || '');
  await loginPage.forgotPasswordLink.click();
  await forgotPasswordPage.waitFor();
  await forgotPasswordPage.emailInput.fill(uniqueEmail);
  await forgotPasswordPage.sendResetEmailButton.click();
  await forgotPasswordPage.emailSentHeading.waitFor();
  await expect(page.getByText('Please check your inbox.')).toBeVisible();

  // get reset password link from mailbox
  await mailbox.goto();
  await mailbox.waitForEmail('Reset your password for Conference Hall');
  const resetPasswordLink = await mailbox.emailContent
    .getByRole('link', { name: 'Reset your password' })
    .getAttribute('href');

  // reset password
  await page.goto(resetPasswordLink || '');
  await resetPasswordPage.waitFor();
  await resetPasswordPage.passwordInput.fill('123Password');
  await resetPasswordPage.resetPasswordButton.click();

  // signin
  await loginPage.waitFor();
  await loginPage.emailInput.fill(uniqueEmail);
  await loginPage.passwordInput.fill('123Password');
  await loginPage.signinButton.click();

  // signout
  await homePage.waitFor();
  await homePage.userMenu.openButton.click({ force: true });
  await homePage.userMenu.waitForDialogOpen(uniqueEmail);
  await homePage.userMenu.signOutButton.click();
  await expect(homePage.loginLink).toBeVisible();

  // signin with captcha enabled
  await flags.set('captcha', true);
  await loginPage.loginLink.click();
  await loginPage.waitFor();
  await loginPage.emailInput.fill(uniqueEmail);
  await loginPage.passwordInput.fill('123Password');
  await loginPage.waitForCaptcha();
  await loginPage.signinButton.click();
  await homePage.waitFor();
});
