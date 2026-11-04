import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { db } from '../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../prisma/generated/client.ts';
import { MailBox } from '../../common/mailbox.page.ts';
import { expect, resetMailbox, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { PageObject } from '../../page-object.ts';

let team: Team;
let event: Event;
let organizer: User;

test.beforeEach(async ({ context }) => {
  organizer = await userLoggedFactory(context);
  team = await teamFactory({ owners: [organizer] });
  event = await eventFactory({ team });
  await resetMailbox();
});

test('delivers the personal message and shares the profile only after the invited speaker accepts', async ({
  page,
  context,
  browser,
}) => {
  const speakerContext = await browser.newContext();
  try {
    const speaker = await userLoggedFactory(speakerContext, {
      attributes: { email: 'speaker@example.com', name: 'Invited Speaker' },
    });
    const message = 'We enjoyed your accessibility talk.\nWould you join our program?';
    await page.goto(`/team/${team.slug}/${event.slug}/speakers`);
    await new PageObject(page).waitForHydration();
    await page.getByRole('link', { name: 'Invite speaker', exact: true }).click();
    await page.getByLabel('Email address', { exact: true }).fill(speaker.email);
    await page.getByLabel('Personal message (optional)').fill(message);
    await page.getByRole('button', { name: 'Send invitation' }).click();
    const invitations = page.getByRole('list', { name: 'Speaker invitations' });
    await expect(invitations.getByText('Pending', { exact: true })).toBeVisible();
    expect(await db.eventSpeaker.count({ where: { eventId: event.id } })).toBe(0);

    const mailbox = new MailBox(await context.newPage());
    await mailbox.goto();
    await mailbox.waitForEmail(`[${event.name}] Speaker invitation`);
    for (const line of message.split('\n')) {
      await expect(mailbox.emailContent.getByText(line)).toBeVisible();
    }
    const invitationUrl = await mailbox.emailContent
      .getByRole('link', { name: 'Review invitation' })
      .getAttribute('href');
    expect(invitationUrl).toBeTruthy();

    const speakerPage = await speakerContext.newPage();
    await speakerPage.goto(invitationUrl!);
    await new PageObject(speakerPage).waitForHydration();
    await expect(speakerPage.getByText(message)).toBeVisible();
    await expect(speakerPage.getByText(/Accepting shares your speaker profile/)).toBeVisible();
    expect(await db.eventSpeaker.count()).toBe(0);
    await speakerPage.getByRole('button', { name: 'Accept invitation' }).click();
    await expect(speakerPage).toHaveURL(new RegExp(`/${event.slug}$`));

    expect(await db.eventSpeaker.findFirst({ where: { eventId: event.id } })).toMatchObject({
      userId: speaker.id,
      bio: speaker.bio,
    });
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'ACCEPTED', token: null });
    await page.reload();
    await expect(invitations.getByText('Accepted', { exact: true })).toBeVisible();
    await speakerPage.goto(invitationUrl!);
    await expect(speakerPage.getByText(/This invitation is unavailable/)).toBeVisible();
    await expect(speakerPage.getByRole('button', { name: 'Accept invitation' })).toHaveCount(0);
  } finally {
    await speakerContext.close();
  }
});

test('supports declining an invitation without a personal message', async ({ page, browser }) => {
  const speakerContext = await browser.newContext();
  try {
    const speaker = await userLoggedFactory(speakerContext);
    await page.request.post(`/team/${team.slug}/${event.slug}/speakers/invite`, {
      form: { intent: 'invite', email: speaker.email },
    });
    const invitation = await db.eventSpeakerInvitation.findFirstOrThrow();
    expect(invitation.message).toBeNull();
    const speakerPage = await speakerContext.newPage();
    await speakerPage.goto(`http://localhost:3001/invite/event/${invitation.token}`);
    await new PageObject(speakerPage).waitForHydration();
    await expect(speakerPage.getByText('Message from the organizer')).toHaveCount(0);
    await speakerPage.getByRole('button', { name: 'Decline invitation' }).click();
    await expect(speakerPage).toHaveURL('http://localhost:3001/speaker');
    expect(await db.eventSpeaker.count()).toBe(0);
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'DECLINED', token: null });
  } finally {
    await speakerContext.close();
  }
});

test('resends and cancels a pending invitation while preserving its personal message', async ({ page }) => {
  const speaker = await userFactory();
  const message = 'A personal message to the speaker';
  const path = `/team/${team.slug}/${event.slug}/speakers/invite`;
  await page.request.post(path, { form: { intent: 'invite', email: speaker.email, message } });
  const original = await db.eventSpeakerInvitation.findFirstOrThrow();
  await page.goto(path);
  await new PageObject(page).waitForHydration();
  await page.getByRole('button', { name: 'Resend', exact: true }).click();
  await expect.poll(async () => (await db.eventSpeakerInvitation.findFirstOrThrow()).token).not.toBe(original.token);
  await expect(page.getByRole('list', { name: 'Speaker invitations' }).getByText(message)).toBeVisible();
  await page.getByRole('button', { name: 'Cancel invitation' }).click();
  await expect(
    page.getByRole('list', { name: 'Speaker invitations' }).getByText('Canceled', { exact: true }),
  ).toBeVisible();
  expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ token: null, message });
  expect(await db.eventSpeaker.count()).toBe(0);
});

test('does not expose the personal message or accept an invitation from another account', async ({ page }) => {
  const speaker = await userFactory();
  const message = 'Private invitation message';
  await page.request.post(`/team/${team.slug}/${event.slug}/speakers/invite`, {
    form: { intent: 'invite', email: speaker.email, message },
  });
  const invitation = await db.eventSpeakerInvitation.findFirstOrThrow();
  const path = `/invite/event/${invitation.token}`;
  await page.goto(path);
  await expect(page.getByText(/This invitation is unavailable/)).toBeVisible();
  await expect(page.getByText(message)).toHaveCount(0);
  await page.request.post(path, { form: { intent: 'accept' } });
  expect(await db.eventSpeaker.count()).toBe(0);
  expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'PENDING' });
});

test('requires sign-in before displaying an invitation message', async ({ page, browser }) => {
  const speaker = await userFactory();
  await page.request.post(`/team/${team.slug}/${event.slug}/speakers/invite`, {
    form: { intent: 'invite', email: speaker.email, message: 'Invitation details' },
  });
  const invitation = await db.eventSpeakerInvitation.findFirstOrThrow();
  const guestContext = await browser.newContext();
  try {
    const guestPage = await guestContext.newPage();
    await guestPage.goto(`http://localhost:3001/invite/event/${invitation.token}`);
    await expect(guestPage).toHaveURL(/\/auth\/login\?redirectTo=/);
    await expect(guestPage.getByText('Invitation details')).toHaveCount(0);
  } finally {
    await guestContext.close();
  }
});

test('renders message markup as text on the recipient page', async ({ page, browser }) => {
  const speakerContext = await browser.newContext();
  try {
    const speaker = await userLoggedFactory(speakerContext);
    const message = '<script>alert("not executable")</script>\nWelcome!';
    await page.request.post(`/team/${team.slug}/${event.slug}/speakers/invite`, {
      form: { intent: 'invite', email: speaker.email, message },
    });
    const invitation = await db.eventSpeakerInvitation.findFirstOrThrow();
    const speakerPage = await speakerContext.newPage();
    await speakerPage.goto(`http://localhost:3001/invite/event/${invitation.token}`);
    await expect(speakerPage.getByText(message)).toBeVisible();
    await expect(speakerPage.locator('script').filter({ hasText: 'not executable' })).toHaveCount(0);
  } finally {
    await speakerContext.close();
  }
});

test('validates message length on the server and retains the entered message after an email error', async ({
  page,
}) => {
  const speaker = await userFactory();
  const path = `/team/${team.slug}/${event.slug}/speakers/invite`;
  await page.request.post(path, { form: { intent: 'invite', email: speaker.email, message: 'x'.repeat(2001) } });
  expect(await db.eventSpeakerInvitation.count()).toBe(0);
  await page.goto(path);
  await new PageObject(page).waitForHydration();
  await page.getByLabel('Email address', { exact: true }).fill('missing@example.com');
  await page.getByLabel('Personal message (optional)').fill('Keep my message');
  await page.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByText("No matching account found. Check the speaker's account email.")).toBeVisible();
  await expect(page.getByLabel('Personal message (optional)')).toHaveValue('Keep my message');
});

test('prevents reviewers from opening the invitation form or sending invitations', async ({ page }) => {
  const speaker = await userFactory();
  await db.teamMember.update({
    where: { memberId_teamId: { memberId: organizer.id, teamId: team.id } },
    data: { role: 'REVIEWER' },
  });
  const path = `/team/${team.slug}/${event.slug}/speakers/invite`;
  expect((await page.request.get(path)).status()).toBe(403);
  expect(
    (await page.request.post(path, { form: { intent: 'invite', email: speaker.email, message: 'Hello' } })).status(),
  ).toBe(403);
  expect(await db.eventSpeakerInvitation.count()).toBe(0);
});
