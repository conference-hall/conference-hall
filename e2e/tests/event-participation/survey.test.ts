import type { Event } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { surveyFactory } from 'tests/factories/surveys.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { LoginPage } from '../auth/login.page.ts';
import { SurveyPage } from './survey.page.ts';

let event: Event;

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  event = await eventFactory({ traits: ['conference', 'conference-cfp-open', 'withSurveyConfig'] });
  await surveyFactory({
    user,
    event,
    attributes: { answers: { accomodation: 'yes', transports: ['taxi', 'train'], info: 'Hello' } },
  });
});

test.describe('when user is connected', () => {
  loginWith('clark-kent');

  test('survey form', async ({ page }) => {
    const surveyPage = new SurveyPage(page);
    await surveyPage.goto(event.slug);

    const accomodationRadioYes = page.getByRole('radio', { name: 'Yes' });
    const accomodationRadioNo = page.getByRole('radio', { name: 'No' });
    const transportTaxiCheckbox = page.getByRole('checkbox', { name: 'Taxi' });
    const transportTrainCheckbox = page.getByRole('checkbox', { name: 'Train' });
    const transportPlaneCheckbox = page.getByRole('checkbox', { name: 'Plane' });
    const commentInput = page.getByRole('textbox', { name: 'Do you have specific information to share?' });

    await test.step('displays initial values survey form', async () => {
      await expect(accomodationRadioYes).toBeChecked();
      await expect(accomodationRadioNo).not.toBeChecked();
      await expect(transportTaxiCheckbox).toBeChecked();
      await expect(transportTrainCheckbox).toBeChecked();
      await expect(transportPlaneCheckbox).not.toBeChecked();
      await expect(commentInput).toHaveValue('Hello');
    });

    await test.step('updates survey form', async () => {
      await accomodationRadioNo.click();
      await transportTaxiCheckbox.click();
      await transportPlaneCheckbox.click();
      await surveyPage.fill(commentInput, 'World');
      await surveyPage.clickOnSave();
      await expect(surveyPage.toast).toHaveText('Survey saved.');
    });

    await test.step('displays updated values survey form', async () => {
      await expect(accomodationRadioYes).not.toBeChecked();
      await expect(accomodationRadioNo).toBeChecked();
      await expect(transportTaxiCheckbox).not.toBeChecked();
      await expect(transportTrainCheckbox).toBeChecked();
      await expect(transportPlaneCheckbox).toBeChecked();
      await expect(commentInput).toHaveValue('World');
    });
  });
});

test.describe('when user is not connected', () => {
  test('redirects to signin', async ({ page }) => {
    await page.goto(`/${event.slug}/survey`);
    const loginPage = new LoginPage(page);
    await loginPage.waitFor();
  });
});
