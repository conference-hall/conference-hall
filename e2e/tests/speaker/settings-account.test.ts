import { DEFAULT_PASSWORD, userFactory } from 'tests/factories/users.ts';
import { MailBox } from '../../common/mailbox.page.ts';
import { expect, test, useLoginSession } from '../../fixtures.ts';
import { LoginPage } from '../auth/login.page.ts';
import { HomePage } from '../event-search/home.page.ts';
import { SettingsAccountPage } from './settings-account.page.ts';

useLoginSession();

test.beforeEach(({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
});

// todo(auth): link/unlink as integration tests (with stubs) and set password
test('display settings page', async ({ page }) => {
  await userFactory({ attributes: { email: 'original@example.net' }, withAuthSession: true });

  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // todo(auth): check default email password section

  // check authentication methods
  await expect(accountPage.linkButton('Google')).toBeVisible();
  await expect(accountPage.linkButton('Github')).toBeVisible();
  await expect(accountPage.linkButton('X.com')).toBeVisible();
});

// todo(auth): make test
test.skip('change email', async ({ page }) => {
  await userFactory({ attributes: { email: 'original@example.net' }, withAuthSession: true });

  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // // check email verification
  // await mailbox.goto();
  // await mailbox.waitForEmail('Verify your email address for Conference Hall');
  // const emailVerificationLink2 = await mailbox.emailContent
  //   .getByRole('link', { name: 'Verify your email address' })
  //   .getAttribute('href');
  // await page.goto(emailVerificationLink2 || '');
  // await homePage.waitFor();
});

// todo(auth): make test
test.skip('change password', async ({ page }) => {
  await userFactory({ attributes: { email: 'original@example.net' }, withAuthSession: true });

  const accountPage = new SettingsAccountPage(page);
  await accountPage.goto();

  // check authentication methods
  await accountPage.goto();
  await expect(accountPage.linkButton('Google')).toBeVisible();
  await expect(accountPage.linkButton('Github')).toBeVisible();
  await expect(accountPage.linkButton('X.com')).toBeVisible();
});

test('delete account', async ({ page }) => {
  const user = await userFactory({ withAuthSession: true });

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
