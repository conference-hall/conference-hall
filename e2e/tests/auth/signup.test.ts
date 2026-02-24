import { MailBox } from '../../common/mailbox.page.ts';
import { expect, resetMailbox, test } from '../../fixtures.ts';
import { HomePage } from '../event-search/home.page.ts';
import { LoginPage } from './login.page.ts';
import { SignupPage } from './signup.page.ts';

test.beforeEach(async () => {
  await resetMailbox();
});

test('Signup flow with email and password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const signupPage = new SignupPage(page);
  const homePage = new HomePage(page);
  const mailbox = new MailBox(page);
  const uniqueEmail = `john.doe.${Date.now()}@example.com`;

  // go to signup page
  await loginPage.goto();
  await loginPage.signupLink.click();

  // signup
  await signupPage.waitFor();
  await signupPage.waitForCaptcha();
  await signupPage.fullnameInput.fill('John Doe');
  await signupPage.emailInput.fill(uniqueEmail);
  await signupPage.passwordInput.fill('abc');
  await signupPage.signupButton.click();
  await expect(page.getByText('Password too short.')).toBeVisible();
  // todo(auth): revert this error message
  // await expect(page.getByText('Minimum 8 characters. Missing uppercase letter. Missing number')).toBeVisible();
  await signupPage.passwordInput.fill('Password123');
  await signupPage.signupButton.click();

  // check email verification
  await signupPage.emailVerificationSent();
  await mailbox.goto();
  await mailbox.waitForEmail('Verify your email address for Conference Hall');
  const emailVerificationLink = await mailbox.emailContent
    .getByRole('link', { name: 'Verify your email address' })
    .getAttribute('href');
  await page.goto(emailVerificationLink || '');
  await homePage.waitFor();

  // signout
  await homePage.userMenu.openButton.click({ force: true });
  await homePage.userMenu.waitForDialogOpen(uniqueEmail);
  await homePage.userMenu.signOutButton.click();
  await homePage.loginLink.click();
});
