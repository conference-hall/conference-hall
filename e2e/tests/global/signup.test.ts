import { flags } from '~/libs/feature-flags/flags.server.ts';
import { test } from '../../fixtures.ts';
import { HomePage } from './home.page.ts';
import { LoginPage } from './login.page.ts';
import { SignupPage } from './signup.page.ts';

test.beforeEach(async () => {
  await flags.set('emailPasswordSignin', true);
});

test('Signup flow with email and password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const signupPage = new SignupPage(page);
  const homePage = new HomePage(page);
  const uniqueEmail = `john.doe.${Date.now()}@example.com`;

  // go to signup page
  await loginPage.goto();
  await loginPage.signupLink.click();

  // signup
  await signupPage.waitFor();
  await signupPage.fullnameInput.fill('John Doe');
  await signupPage.emailInput.fill(uniqueEmail);
  await signupPage.passwordInput.fill('password123');
  await signupPage.signupButton.click();

  // signout
  await homePage.waitFor();
  await homePage.userMenu.openButton.click({ force: true });
  await homePage.userMenu.waitForDialogOpen(uniqueEmail);
  await homePage.userMenu.signOutButton.click();

  // signin
  await homePage.loginLink.click();
  await loginPage.waitFor();
  await loginPage.emailInput.fill(uniqueEmail);
  await loginPage.passwordInput.fill('password123');
  await loginPage.signinButton.click();

  // check connected user
  await homePage.waitFor();
  await homePage.userMenu.openButton.click({ force: true });
  await homePage.userMenu.waitForDialogOpen(uniqueEmail);
});
