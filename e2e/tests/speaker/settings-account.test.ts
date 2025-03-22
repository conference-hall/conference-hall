import { MailBox } from 'e2e/common/mailbox.page.ts';
import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { expect, test } from '../../fixtures.ts';
import { HomePage } from '../global/home.page.ts';
import { LoginPage } from '../global/login.page.ts';
import { SignupPage } from '../global/signup.page.ts';
import { SettingsAccountPage } from './settings-account.page.ts';

test('links and unlinks providers, change password, verify email', async ({ page }) => {
  await flags.set('emailPasswordSignin', true);
  await userFactory({ traits: ['clark-kent'] });

  const mailbox = new MailBox(page);
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const signupPage = new SignupPage(page);
  const accountPage = new SettingsAccountPage(page);
  const uniqueEmail = `john.doe.${Date.now()}@example.com`;
  const uniqueEmail2 = `jdoe.${Date.now()}@example.com`;
  page.on('dialog', (dialog) => dialog.accept());

  // signup new user
  await signupPage.goto();
  await signupPage.fullnameInput.fill('John Doe');
  await signupPage.emailInput.fill(uniqueEmail);
  await signupPage.passwordInput.fill('Password123');
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
  await loginPage.waitFor();
  await loginPage.passwordInput.fill('Password123');
  await loginPage.signinButton.click();
  await homePage.waitFor();

  // check authentication methods
  await accountPage.goto();
  await expect(accountPage.changePasswordButton()).toBeVisible();
  await expect(accountPage.linkButton('Google')).toBeVisible();
  await expect(accountPage.linkButton('Github')).toBeVisible();
  await expect(accountPage.linkButton('X.com')).toBeVisible();

  // link Google social provider
  await accountPage.linkButton('Google').click();
  await accountPage.authEmulator.waitFor('Google');
  await accountPage.authEmulator.newAccount(uniqueEmail, 'Google User');
  await expect(accountPage.unlinkButton('Google')).toBeVisible();

  // link GitHub social provider
  await accountPage.linkButton('Github').click();
  await accountPage.authEmulator.waitFor('Github');
  await accountPage.authEmulator.newAccount(uniqueEmail, 'Github User');
  await expect(accountPage.unlinkButton('Github')).toBeVisible();

  // link Twitter social provider
  await accountPage.linkButton('X.com').click();
  await accountPage.authEmulator.waitFor('Twitter');
  await accountPage.authEmulator.newAccount(uniqueEmail2, 'Twitter User');
  await expect(accountPage.unlinkButton('X.com')).toBeVisible();

  // should have 2 emails in contact email form
  await expect(accountPage.emailInput.getByRole('option')).toHaveCount(2);
  await expect(accountPage.emailInput).toHaveValue(uniqueEmail);

  // change contact email
  await accountPage.emailInput.selectOption(uniqueEmail2);
  await accountPage.saveContactEmail.click();
  await expect(accountPage.toast).toHaveText('Contact email changed.');
  await expect(accountPage.emailInput).toHaveValue(uniqueEmail2);

  // unlink Twitter social provider
  await accountPage.unlinkButton('X.com').click();
  await expect(accountPage.linkButton('X.com')).toBeVisible();

  // should have 1 email in contact email form
  await expect(accountPage.emailInput.getByRole('option')).toHaveCount(1);
  await expect(accountPage.emailInput).toHaveValue(uniqueEmail);

  // change password for password-based provider
  await accountPage.changePasswordButton().click();
  await accountPage.changePassword('Password123', 'NewPassword123');

  // signin with the new password
  await loginPage.waitFor();
  await loginPage.emailInput.fill(uniqueEmail);
  await loginPage.passwordInput.fill('NewPassword123');
  await loginPage.signinButton.click();
  await homePage.waitFor();

  // unlink password-based provider
  await accountPage.goto();
  await accountPage.unlinkButton('Email & password').click();

  // link new password-based provider
  await accountPage.linkButton('Email & password').click();
  await accountPage.linkEmailProvider(uniqueEmail, 'Password123');
  await accountPage.emailVerificationSent();

  // check email verification received
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');

  // sign in with Google
  await loginPage.goto();
  await loginPage.signInWithGoogle(uniqueEmail);
  await homePage.waitFor();

  // verify email
  await accountPage.goto();
  await accountPage.verifyEmailButton().click();
  await expect(accountPage.emailSent()).toBeVisible();

  // check email verification
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');
  const emailVerificationLink2 = await mailbox.emailContent
    .getByRole('link', { name: 'Verify your email address' })
    .getAttribute('href');
  await page.goto(emailVerificationLink2 || '');
  await homePage.waitFor();

  // check authentication methods
  await accountPage.goto();
  await expect(accountPage.unlinkButton('Email & password')).toBeVisible();
  await expect(accountPage.unlinkButton('Google')).toBeVisible();
  await expect(accountPage.unlinkButton('Github')).toBeVisible();
  await expect(accountPage.linkButton('X.com')).toBeVisible();
});
