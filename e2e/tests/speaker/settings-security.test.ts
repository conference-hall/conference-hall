import { MailBox } from 'e2e/common/mailbox.page.ts';
import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { expect, test } from '../../fixtures.ts';
import { HomePage } from '../global/home.page.ts';
import { LoginPage } from '../global/login.page.ts';
import { SignupPage } from '../global/signup.page.ts';
import { SettingsSecurityPage } from './settings-security.page.ts';

test('Authentication methods actions and flows', async ({ page }) => {
  await flags.set('emailPasswordSignin', true);
  await userFactory({ traits: ['clark-kent'] });

  const mailbox = new MailBox(page);
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const signupPage = new SignupPage(page);
  const securityPage = new SettingsSecurityPage(page);
  const uniqueEmail = `john.doe.${Date.now()}@example.com`;
  page.on('dialog', (dialog) => dialog.accept());

  // signup new user
  await signupPage.goto();
  await signupPage.fullnameInput.fill('John Doe');
  await signupPage.emailInput.fill(uniqueEmail);
  await signupPage.passwordInput.fill('password');
  await signupPage.signupButton.click();
  await signupPage.emailVerificationSent();

  // check email verification
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');
  const emailVerificationLink = await mailbox.emailContent
    .getByRole('link', { name: 'Verify your email address' })
    .getAttribute('href');

  // signin user
  await page.goto(emailVerificationLink || '');
  await loginPage.passwordInput.fill('password');
  await loginPage.signinButton.click();
  await homePage.waitFor();

  // check authentication methods
  await securityPage.goto();
  await expect(securityPage.changePasswordButton()).toBeVisible();
  await expect(securityPage.linkButton('Google')).toBeVisible();
  await expect(securityPage.linkButton('Github')).toBeVisible();
  await expect(securityPage.linkButton('X.com')).toBeVisible();

  // link Google social provider
  await securityPage.linkButton('Google').click();
  await securityPage.authEmulator.waitFor('Google');
  await securityPage.authEmulator.newAccount(uniqueEmail, 'Google User');
  await expect(securityPage.unlinkButton('Google')).toBeVisible();

  // link GitHub social provider
  await securityPage.linkButton('Github').click();
  await securityPage.authEmulator.waitFor('Github');
  await securityPage.authEmulator.newAccount(uniqueEmail, 'Github User');
  await expect(securityPage.unlinkButton('Github')).toBeVisible();

  // link Twitter social provider
  await securityPage.linkButton('X.com').click();
  await securityPage.authEmulator.waitFor('Twitter');
  await securityPage.authEmulator.newAccount(uniqueEmail, 'Twitter User');
  await expect(securityPage.unlinkButton('X.com')).toBeVisible();

  // Unlink Twitter social provider
  await securityPage.unlinkButton('X.com').click();
  await expect(securityPage.linkButton('X.com')).toBeVisible();

  // Change password for password-based provider
  await securityPage.changePasswordButton().click();
  await securityPage.changePassword('password', 'newpassword');

  // Signin with the new password
  await loginPage.waitFor();
  await loginPage.emailInput.fill(uniqueEmail);
  await loginPage.passwordInput.fill('newpassword');
  await loginPage.signinButton.click();
  await homePage.waitFor();

  // Unlink password-based provider
  await securityPage.goto();
  await securityPage.unlinkButton('Email & password').click();

  // Link new password-based provider
  await securityPage.linkButton('Email & password').click();
  await securityPage.linkEmailProvider(uniqueEmail, 'password');
  await securityPage.emailVerificationSent();

  // check email verification received
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');

  // Sign in with Google
  await loginPage.goto();
  await loginPage.signInWithGoogle(uniqueEmail);
  await homePage.waitFor();

  // Verify email
  await securityPage.goto();
  await securityPage.verifyEmailButton().click();
  await expect(securityPage.emailSent()).toBeVisible();

  // check email verification
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');
  const emailVerificationLink2 = await mailbox.emailContent
    .getByRole('link', { name: 'Verify your email address' })
    .getAttribute('href');
  await page.goto(emailVerificationLink2 || '');
  await homePage.waitFor();

  // Check authentication methods
  await securityPage.goto();
  await expect(securityPage.unlinkButton('Email & password')).toBeVisible();
  await expect(securityPage.unlinkButton('Google')).toBeVisible();
  await expect(securityPage.unlinkButton('Github')).toBeVisible();
  await expect(securityPage.linkButton('X.com')).toBeVisible();
});
