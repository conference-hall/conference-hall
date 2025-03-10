import { userFactory } from 'tests/factories/users.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { expect, test } from '../../fixtures.ts';
import { ProfilePage } from '../speaker/profile.page.ts';
import { ForgotPasswordPage, LoginPage } from './login.page.ts';

test('log in with Google and redirect', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });

  await page.goto('/speaker/profile');

  const loginPage = new LoginPage(page);
  await loginPage.waitFor();
  await loginPage.signInWithGoogle(user.name);

  const profilePage = new ProfilePage(page);
  await profilePage.waitFor();
});

test('reset email with forgot password page', async ({ page }) => {
  await flags.set('emailPasswordSignin', true);

  // TODO: create existing user in db

  const loginPage = new LoginPage(page);
  const forgotPasswordPage = new ForgotPasswordPage(page);
  const uniqueEmail = 'john.doe@example.com';

  // go to forgot password page
  await loginPage.goto();
  await loginPage.forgotPasswordLink.click();
  await forgotPasswordPage.waitFor();

  // send reset password email
  await forgotPasswordPage.emailInput.fill(uniqueEmail);
  await forgotPasswordPage.sendResetEmailButton.click();
  await forgotPasswordPage.emailSentHeading.waitFor();
  await expect(page.getByText('Please check your inbox.')).toBeVisible();

  // TODO: reset password and connect
});
