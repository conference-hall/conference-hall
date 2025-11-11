import { MailBox } from 'e2e/common/mailbox.page.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, test } from '../../fixtures.ts';
import { LoginPage } from '../auth/login.page.ts';
import { SignupPage } from '../auth/signup.page.ts';
import { HomePage } from '../event-search/home.page.ts';
import { SettingsAccountPage } from './settings-account.page.ts';

test('links and unlinks providers, change password, verify email', async ({ page }) => {
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

  // unlink password-based provider
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

  // find and click delete button
  const deleteButton = page.getByRole('button', { name: 'Delete account' });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  // fill confirmation text in modal
  const confirmationInput = page.getByLabel(/delete my account/i);
  await expect(confirmationInput).toBeVisible();
  await confirmationInput.fill('delete my account');

  // submit deletion
  const confirmDeleteButton = page.getByRole('button', { name: 'Delete account' }).last();
  await confirmDeleteButton.click();

  // verify redirect to home and success toast
  await homePage.waitFor();
  await expect(page.getByText('Your account has been successfully deleted.')).toBeVisible();

  // verify email confirmation
  await mailbox.goto();
  await mailbox.waitForEmail('Your Conference Hall account has been deleted');

  // verify user cannot log back in
  await loginPage.goto();
  await loginPage.emailInput.fill(uniqueEmail);
  await loginPage.passwordInput.fill('Password123');
  await loginPage.signinButton.click();
  await expect(page.getByText(/Email or password is incorrect/i)).toBeVisible();
});
