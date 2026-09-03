import { conversationMessageFactory } from 'tests/factories/conversation-messages.ts';
import { conversationParticipantFactory } from 'tests/factories/conversation-participants.ts';
import { conversationFactory } from 'tests/factories/conversations.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { db } from '~/../prisma/db.server.ts';
import type { Conversation, Event, Proposal, User } from '~/../prisma/generated/client.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { conversationDigest } from './conversation-digest.job.ts';

const sendEmailTrigger = sendEmail.trigger as Mock;

type World = { organizer: User; speaker: User; team: { slug: string }; event: Event; proposal: Proposal };

async function setupWorld(eventAttributes = {}): Promise<World> {
  const organizer = await userFactory({ attributes: { name: 'Orga', email: 'orga@example.com' } });
  const speaker = await userFactory({ attributes: { name: 'Speaker', email: 'speaker@example.com', locale: 'en' } });
  const team = await teamFactory({ owners: [organizer], attributes: { slug: 'team-1' } });
  const event = await eventFactory({ team, attributes: { slug: 'event-1', name: 'Event 1', ...eventAttributes } });
  const talk = await talkFactory({ speakers: [speaker], attributes: { title: 'My talk' } });
  const proposal = await proposalFactory({ event, talk, attributes: { title: 'My talk' } });
  return { organizer, speaker, team, event, proposal };
}

async function speakerConversationWithUnread(
  world: World,
  {
    messageDate = new Date('2026-06-20T10:00:00Z'),
    participant = {},
  }: { messageDate?: Date; participant?: object } = {},
): Promise<{ conversation: Conversation; messageDate: Date }> {
  const conversation = await conversationFactory({
    event: world.event,
    proposalId: world.proposal.id,
    type: 'PROPOSAL_SPEAKER_CONVERSATION',
  });
  await conversationParticipantFactory({ conversation, user: world.speaker, role: 'SPEAKER', attributes: participant });
  await conversationMessageFactory({
    conversation,
    sender: world.organizer,
    role: 'ORGANIZER',
    attributes: { content: 'Hello speaker', createdAt: messageDate },
  });
  return { conversation, messageDate };
}

async function participantFor(conversation: Conversation, user: User) {
  return db.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: conversation.id, userId: user.id } },
  });
}

describe('Job: conversationDigest', () => {
  beforeEach(async () => {
    await flags.set('conversationDigest', true);
  });

  it('is scheduled to run daily at 08:00 UTC', () => {
    expect(conversationDigest.config.repeat).toEqual({ pattern: '0 8 * * *', tz: 'UTC' });
  });

  it('emails a participant who has unread messages', async () => {
    const world = await setupWorld();
    const { conversation, messageDate } = await speakerConversationWithUnread(world);

    await conversationDigest.config.run();

    expect(sendEmailTrigger).toHaveBeenCalledTimes(1);
    const payload = sendEmailTrigger.mock.calls[0][0];
    expect(payload.template).toBe('speakers-conversation-digest');
    expect(payload.to).toEqual(['speaker@example.com']);
    expect(payload.locale).toBe('en');
    expect(payload.data.events).toEqual([
      {
        name: 'Event 1',
        logo: null,
        proposals: [
          {
            title: 'My talk',
            conversations: [
              {
                type: 'speaker',
                count: 1,
                url: expect.stringContaining(`/event-1/proposals/${world.proposal.id}?conversation=speaker`),
              },
            ],
          },
        ],
      },
    ]);

    expect(payload.data.unsubscribeUrl).toContain('/unsubscribe?token=');
    expect(payload.headers['List-Unsubscribe']).toContain('/unsubscribe?token=');

    const speakerParticipant = await participantFor(conversation, world.speaker);
    expect(speakerParticipant?.lastDigestedAt).toEqual(messageDate);
    const organizerParticipant = await participantFor(conversation, world.organizer);
    expect(organizerParticipant?.lastDigestedAt).toBeNull();
  });

  it('sends nothing when there is no unread message', async () => {
    const world = await setupWorld();
    const conversation = await conversationFactory({
      event: world.event,
      proposalId: world.proposal.id,
      type: 'PROPOSAL_SPEAKER_CONVERSATION',
    });
    await conversationParticipantFactory({ conversation, user: world.speaker, role: 'SPEAKER' });
    await conversationMessageFactory({ conversation, sender: world.speaker, role: 'SPEAKER' });

    await conversationDigest.config.run();

    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('excludes SYSTEM messages from the digest', async () => {
    const world = await setupWorld();
    const conversation = await conversationFactory({
      event: world.event,
      proposalId: world.proposal.id,
      type: 'PROPOSAL_SPEAKER_CONVERSATION',
    });
    await conversationParticipantFactory({ conversation, user: world.speaker, role: 'SPEAKER' });
    await conversationMessageFactory({
      conversation,
      sender: world.organizer,
      role: 'ORGANIZER',
      attributes: { type: 'SYSTEM' },
    });

    await conversationDigest.config.run();

    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('excludes messages already read in-app (lastSeenAt) or already digested (lastDigestedAt)', async () => {
    const world = await setupWorld();
    await speakerConversationWithUnread(world, {
      messageDate: new Date('2026-06-20T10:00:00Z'),
      participant: { lastSeenAt: new Date('2026-06-21T10:00:00Z') },
    });

    const speakerB = await userFactory({ attributes: { email: 'speaker2@example.com' } });
    const talkB = await talkFactory({ speakers: [speakerB], attributes: { title: 'Talk B' } });
    const proposalB = await proposalFactory({ event: world.event, talk: talkB, attributes: { title: 'Talk B' } });
    await speakerConversationWithUnread(
      { ...world, speaker: speakerB, proposal: proposalB },
      {
        messageDate: new Date('2026-06-20T10:00:00Z'),
        participant: { lastDigestedAt: new Date('2026-06-21T10:00:00Z') },
      },
    );

    await conversationDigest.config.run();

    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('does not re-emit an already-digested conversation on a second run', async () => {
    const world = await setupWorld();
    await speakerConversationWithUnread(world);

    await conversationDigest.config.run();
    expect(sendEmailTrigger).toHaveBeenCalledTimes(1);

    sendEmailTrigger.mockClear();
    await conversationDigest.config.run();
    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('picks up a message that arrives after a previous digest', async () => {
    const world = await setupWorld();
    const { conversation } = await speakerConversationWithUnread(world, {
      messageDate: new Date('2026-06-20T10:00:00Z'),
    });

    await conversationDigest.config.run();
    sendEmailTrigger.mockClear();

    const newer = new Date('2026-06-22T10:00:00Z');
    await conversationMessageFactory({
      conversation,
      sender: world.organizer,
      role: 'ORGANIZER',
      attributes: { content: 'Following up', createdAt: newer },
    });

    await conversationDigest.config.run();

    expect(sendEmailTrigger).toHaveBeenCalledTimes(1);
    const payload = sendEmailTrigger.mock.calls[0][0];
    expect(payload.data.events[0].proposals[0].conversations[0].count).toBe(1);
    const speakerParticipant = await participantFor(conversation, world.speaker);
    expect(speakerParticipant?.lastDigestedAt).toEqual(newer);
  });

  it('does not digest speaker threads when speaker conversations are disabled for the event', async () => {
    const world = await setupWorld({ speakersConversationEnabled: false });
    await speakerConversationWithUnread(world);

    await conversationDigest.config.run();

    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('always digests review-comment threads regardless of the speaker-conversation setting', async () => {
    const world = await setupWorld({ speakersConversationEnabled: false });
    const organizer2 = await userFactory({ attributes: { name: 'Orga2', email: 'orga2@example.com' } });

    const conversation = await conversationFactory({
      event: world.event,
      proposalId: world.proposal.id,
      type: 'PROPOSAL_REVIEW_COMMENTS',
    });
    await conversationParticipantFactory({ conversation, user: world.organizer, role: 'ORGANIZER' });
    await conversationMessageFactory({ conversation, sender: organizer2, role: 'ORGANIZER' });

    await conversationDigest.config.run();

    expect(sendEmailTrigger).toHaveBeenCalledTimes(1);
    const payload = sendEmailTrigger.mock.calls[0][0];
    expect(payload.to).toEqual(['orga@example.com']);
    const line = payload.data.events[0].proposals[0].conversations[0];
    expect(line.type).toBe('review');
    expect(line.url).toContain(`/team/team-1/event-1/proposals/${world.proposal.id}?conversation=review`);
  });

  it('skips soft-deleted users', async () => {
    const world = await setupWorld();
    world.speaker = await userFactory({
      attributes: { email: 'deleted@example.com', deletedAt: new Date('2026-01-01T00:00:00Z') },
    });
    await speakerConversationWithUnread(world);

    await conversationDigest.config.run();

    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('skips users who disabled the digest preference', async () => {
    const world = await setupWorld();
    world.speaker = await userFactory({
      attributes: { email: 'optout@example.com', conversationDigestEnabled: false },
    });
    await speakerConversationWithUnread(world);

    await conversationDigest.config.run();

    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('does nothing when the conversationDigest flag is off', async () => {
    await flags.set('conversationDigest', false);
    const world = await setupWorld();
    await speakerConversationWithUnread(world);

    await conversationDigest.config.run();

    expect(sendEmailTrigger).not.toHaveBeenCalled();
  });

  it('batches multiple conversations of a recipient into a single email', async () => {
    const world = await setupWorld();
    await speakerConversationWithUnread(world);

    const talk2 = await talkFactory({ speakers: [world.speaker], attributes: { title: 'Second talk' } });
    const proposal2 = await proposalFactory({ event: world.event, talk: talk2, attributes: { title: 'Second talk' } });
    const conversation2 = await conversationFactory({
      event: world.event,
      proposalId: proposal2.id,
      type: 'PROPOSAL_SPEAKER_CONVERSATION',
    });
    await conversationParticipantFactory({ conversation: conversation2, user: world.speaker, role: 'SPEAKER' });
    await conversationMessageFactory({ conversation: conversation2, sender: world.organizer, role: 'ORGANIZER' });
    await conversationMessageFactory({ conversation: conversation2, sender: world.organizer, role: 'ORGANIZER' });

    await conversationDigest.config.run();

    expect(sendEmailTrigger).toHaveBeenCalledTimes(1);
    const payload = sendEmailTrigger.mock.calls[0][0];
    expect(payload.data.events).toHaveLength(1);
    const proposals = payload.data.events[0].proposals;
    expect(proposals).toHaveLength(2);
    const secondTalk = proposals.find((p: { title: string }) => p.title === 'Second talk');
    expect(secondTalk.conversations[0].count).toBe(2);
  });
});
