import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { PublicationPage } from './publication.page.ts';

loginWith('clark-kent');

test('displays publication page', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const speaker1 = await userFactory();
  const speaker2 = await userFactory();

  await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1] }) });
  await proposalFactory({ event, traits: ['accepted'], talk: await talkFactory({ speakers: [speaker2] }) });
  await proposalFactory({ event, traits: ['accepted-published'], talk: await talkFactory({ speakers: [speaker2] }) });
  await proposalFactory({ event, traits: ['rejected'], talk: await talkFactory({ speakers: [speaker2] }) });
  await proposalFactory({ event, traits: ['rejected-published'], talk: await talkFactory({ speakers: [speaker1] }) });

  const publicationPage = new PublicationPage(page);
  await publicationPage.goto(team.slug, event.slug);

  await expect(publicationPage.dashboardCard('Total results published').getByText('2 / 4')).toBeVisible();
  await expect(publicationPage.dashboardCard('Accepted proposals to publish').getByText('1')).toBeVisible();
  await expect(publicationPage.dashboardCard('Rejected proposals to publish').getByText('1')).toBeVisible();

  // Publish accepted proposals
  const acceptedModal = await publicationPage.clickOnPublish('Accepted proposals to publish', 'Accepted');
  await acceptedModal.clickOnConfirm();
  await expect(publicationPage.toast).toHaveText('Accepted proposals published.');
  await expect(publicationPage.dashboardCard('Total results published').getByText('3 / 4')).toBeVisible();
  await expect(publicationPage.dashboardCard('Accepted proposals to publish').getByText('0')).toBeVisible();

  // Publish rejected proposals
  const rejectedModal = await publicationPage.clickOnPublish('Rejected proposals to publish', 'Rejected');
  await rejectedModal.clickOnConfirm();
  await expect(publicationPage.toast).toHaveText('Rejected proposals published.');
  await expect(publicationPage.dashboardCard('Total results published').getByText('4 / 4')).toBeVisible();
  await expect(publicationPage.dashboardCard('Rejected proposals to publish').getByText('0')).toBeVisible();
});

test.describe('as a team reviewer', () => {
  loginWith('bruce-wayne');

  test('does not have access to publication', async ({ page }) => {
    const user = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ reviewers: [user] });
    const event = await eventFactory({ team });

    await page.goto(`/team/${team.slug}/${event.slug}/publication`);

    const publicationPage = new PublicationPage(page);
    await expect(publicationPage.forbiddenPage).toBeVisible();
  });
});
