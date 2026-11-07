import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { submissionPassFactory } from 'tests/factories/submission-passes.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, test } from '../../../fixtures.ts';
import { userLoggedFactory } from '../../../helpers.ts';
import { NavigationSettingsPage } from './navigation-settings.page.ts';
import { SubmissionPassesSettingsPage } from './submission-passes-settings.page.ts';

test('creates a submission pass and deletes it', async ({ context, page }) => {
  const user = await userLoggedFactory(context);
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-past'] });

  const settingsPage = new NavigationSettingsPage(page);
  await settingsPage.goto(team.slug, event.slug);
  await page.getByRole('link', { name: 'Submission passes' }).click();

  const passesPage = new SubmissionPassesSettingsPage(page);
  await passesPage.waitFor();
  await expect(passesPage.unusedHeading).not.toBeVisible();
  await expect(passesPage.usedHeading).not.toBeVisible();

  await passesPage.fill(passesPage.labelInput, 'Keynote Jane Doe');
  await passesPage.createButton.click();

  await expect(passesPage.toast).toContainText('Pass "Keynote Jane Doe" created. Copy its link to share it.');
  await expect(passesPage.labelInput).toHaveValue('');
  await expect(passesPage.unusedList).toHaveCount(1);
  await expect(passesPage.unusedList.first()).toContainText('Keynote Jane Doe');
  await expect(passesPage.usedHeading).not.toBeVisible();

  page.on('dialog', (dialog) => dialog.accept());
  await passesPage.unusedList.first().getByRole('button', { name: 'Delete' }).click();
  await expect(passesPage.toast).toContainText('Pass deleted.');
  await expect(passesPage.unusedHeading).not.toBeVisible();
});

test('lists used submission passes with their holder', async ({ context, page }) => {
  const user = await userLoggedFactory(context);
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-past'] });
  const speaker = await userFactory({ traits: ['clark-kent'] });
  const eventSpeaker = await eventSpeakerFactory({ event, user: speaker });
  await submissionPassFactory({ event, user: speaker, attributes: { label: 'Keynote Clark' } });
  await submissionPassFactory({
    event,
    user: await userFactory({ traits: ['bruce-wayne'] }),
    attributes: { label: 'Late Bruce' },
  });

  const passesPage = new SubmissionPassesSettingsPage(page);
  await passesPage.goto(team.slug, event.slug);

  await expect(passesPage.usedList).toHaveCount(2);
  await expect(passesPage.unusedHeading).not.toBeVisible();
  await expect(passesPage.usedList.getByRole('link', { name: 'Clark Kent' })).toHaveAttribute(
    'href',
    `/team/${team.slug}/${event.slug}/speakers/${eventSpeaker.id}`,
  );
  await expect(passesPage.usedList.filter({ hasText: 'Late Bruce' })).toContainText('Bruce Wayne');
  await expect(passesPage.usedList.getByRole('link', { name: 'Bruce Wayne' })).not.toBeVisible();

  page.on('dialog', (dialog) => dialog.accept());
  await passesPage.usedList.filter({ hasText: 'Late Bruce' }).getByRole('button', { name: 'Delete' }).click();
  await expect(passesPage.toast).toContainText('Pass deleted.');
  await expect(passesPage.usedList).toHaveCount(1);
});
