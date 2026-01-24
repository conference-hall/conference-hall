import { DEFAULT_PASSWORD, userFactory } from 'tests/factories/users.ts';
import { MailBox } from '../../common/mailbox.page.ts';
import { expect, resetMailbox, test, useLoginSession } from '../../fixtures.ts';
import { LoginPage } from '../auth/login.page.ts';
import { ResetPasswordPage } from '../auth/reset-password.page.ts';
import { HomePage } from '../event-search/home.page.ts';
import { SettingsAccountPage } from './settings-account.page.ts';

useLoginSession();

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
  await resetMailbox();
});

test('display settings page', async ({ page }) => {
  await userFactory({
    attributes: { email: 'original@example.net' },
    withPasswordAccount: true,
    withAuthSession: true,
  });

  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // check email and password section
  await expect(page.getByText('original@example.net')).toBeVisible();
  await expect(accountPage.emailEditButton).toBeVisible();
  await expect(accountPage.passwordEditButton).toBeVisible();

  // check authentication methods
  await expect(accountPage.linkButton('Google')).toBeVisible();
  await expect(accountPage.linkButton('Github')).toBeVisible();
  await expect(accountPage.linkButton('X.com')).toBeVisible();
});

test('change email', async ({ page }) => {
  await userFactory({
    attributes: { email: 'original@example.net' },
    withPasswordAccount: true,
    withAuthSession: true,
  });

  const mailbox = new MailBox(page);
  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // open change email modal
  await accountPage.emailEditButton.click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByRole('heading', { name: 'Change your email' })).toBeVisible();

  // fill new email and submit
  const newEmailInput = modal.getByRole('textbox');
  await newEmailInput.fill('newemail@example.net');
  await modal.getByRole('button', { name: 'Send link' }).click();

  // verify success toast
  await expect(page.getByText('Link sent to newemail@example.net')).toBeVisible();

  // go to mailbox and click the verification link
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');
  const verificationLink = await mailbox.emailContent
    .getByRole('link', { name: 'Verify your email address' })
    .getAttribute('href');
  await page.goto(verificationLink || '');

  // verify redirect to settings page with updated email
  await accountPage.waitFor();
  await expect(page.getByText('newemail@example.net')).toBeVisible();
});

test('change password', async ({ page }) => {
  await userFactory({
    attributes: { email: 'original@example.net' },
    withPasswordAccount: true,
    withAuthSession: true,
  });

  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // open change password modal
  await accountPage.passwordEditButton.click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByRole('heading', { name: 'Change your password' })).toBeVisible();

  // fill current and new passwords
  await modal.getByLabel('Current password').fill(DEFAULT_PASSWORD);
  await modal.getByLabel('New password').fill('NewPassword456');
  await modal.getByRole('button', { name: 'Edit' }).click();

  // verify success toast
  await expect(page.getByText('Password changed.')).toBeVisible();

  // clear session and verify login with new password
  await page.context().clearCookies();
  await loginPage.goto();
  await loginPage.signInWithPassword('original@example.net', 'NewPassword456');
  await homePage.waitFor();
});

test('set a password', async ({ page }) => {
  await userFactory({
    attributes: { email: 'original@example.net' },
    withSocialAccount: true,
    withAuthSession: true,
  });

  const mailbox = new MailBox(page);
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const resetPasswordPage = new ResetPasswordPage(page);
  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // open set password modal
  await accountPage.passwordAddButton.click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByRole('heading', { name: 'Set your password' })).toBeVisible();

  // submit to send reset link
  await modal.getByRole('button', { name: 'Send link' }).click();

  // verify success toast
  await expect(page.getByText('Link sent to original@example.net')).toBeVisible();

  // go to mailbox and click the reset password link
  await mailbox.goto();
  await mailbox.waitForEmail('Set your password for Conference Hall');
  const resetLink = await mailbox.emailContent.getByRole('link', { name: 'Set your password' }).getAttribute('href');

  // clear session before navigating to reset link to avoid auth redirects
  await page.context().clearCookies();
  await page.goto(resetLink || '');

  // set the password
  await resetPasswordPage.waitFor();
  await resetPasswordPage.passwordInput.fill('MyNewPassword123');
  await resetPasswordPage.resetPasswordButton.click();

  // verify login with the new password
  await loginPage.waitFor();
  await loginPage.signInWithPassword('original@example.net', 'MyNewPassword123');
  await homePage.waitFor();
});

test('delete account', async ({ page }) => {
  const user = await userFactory({ withPasswordAccount: true, withAuthSession: true });

  const mailbox = new MailBox(page);
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);
  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // find and click delete button
  const deleteButton = page.getByRole('button', { name: 'Delete my account' });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  // fill confirmation text in modal
  const deleteAccountModal = page.getByRole('dialog');
  await expect(deleteAccountModal.getByRole('heading', { name: 'Delete my account' })).toBeVisible();
  const confirmationInput = deleteAccountModal.getByRole('textbox');
  await confirmationInput.fill('delete my account');

  // submit deletion
  const confirmDeleteButton = deleteAccountModal.getByRole('button', { name: 'Delete my account' }).last();
  await confirmDeleteButton.click();

  // verify redirect to home and success toast
  await homePage.waitFor();
  await expect(page.getByText('Your account has been successfully deleted.')).toBeVisible();

  // verify email confirmation
  await mailbox.goto();
  await mailbox.waitForEmail('Your Conference Hall account has been deleted');

  // verify user cannot log back in
  await loginPage.goto();
  await loginPage.emailInput.fill(user.email);
  await loginPage.passwordInput.fill(DEFAULT_PASSWORD);
  await loginPage.signinButton.click();
  await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
});
