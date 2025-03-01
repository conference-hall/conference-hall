import { TalkLevel } from '@prisma/client';
import { db } from 'prisma/db.server.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Mock } from 'vitest';
import { sendEmail } from '~/emails/send-email.job.ts';
import {
  CfpNotOpenError,
  EventNotFoundError,
  MaxSubmittedProposalsReachedError,
  ProposalNotFoundError,
  TalkNotFoundError,
} from '~/libs/errors.server.ts';
import { sendSubmittedTalkSlackMessage } from './slack/slack.services.ts';
import { TalkSubmission } from './talk-submission.ts';

vi.mock('./slack/slack.services.ts', () => {
  return { sendSubmittedTalkSlackMessage: vi.fn() };
});
const sendSubmittedTalkSlackMessageMock = sendSubmittedTalkSlackMessage as Mock;

describe('TalkSubmission', () => {
  describe('#saveDraft', () => {
    it('create a new draft proposal from scratch', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();

      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const { talkId } = await TalkSubmission.for(speaker.id, event.slug).saveDraft('new', data);

      const talk = await db.talk.findUnique({ where: { id: talkId }, include: { speakers: true } });
      expect(talk?.title).toEqual(data.title);
      expect(talk?.abstract).toEqual(data.abstract);
      expect(talk?.references).toEqual(data.references);
      expect(talk?.languages).toEqual(data.languages);
      expect(talk?.level).toEqual(data.level);
      expect(talk?.speakers[0].id).toEqual(speaker.id);

      const proposal = await db.proposal.findFirst({ where: { talkId }, include: { legacySpeakers: true } });
      expect(proposal?.title).toEqual(data.title);
      expect(proposal?.abstract).toEqual(data.abstract);
      expect(proposal?.references).toEqual(data.references);
      expect(proposal?.isDraft).toEqual(true);
      expect(proposal?.eventId).toEqual(event.id);
      expect(proposal?.languages).toEqual(data.languages);
      expect(proposal?.level).toEqual(data.level);
      expect(proposal?.legacySpeakers[0].id).toEqual(speaker.id);
    });

    it('create a new draft proposal from a existing talk', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['de'],
        level: TalkLevel.ADVANCED,
      };

      const { talkId } = await TalkSubmission.for(speaker.id, event.slug).saveDraft(talk.id, data);

      const updatedTalk = await db.talk.findUnique({ where: { id: talkId }, include: { speakers: true } });
      expect(updatedTalk?.title).toEqual(data.title);
      expect(updatedTalk?.abstract).toEqual(data.abstract);
      expect(updatedTalk?.references).toEqual(data.references);
      expect(updatedTalk?.languages).toEqual(data.languages);
      expect(updatedTalk?.level).toEqual(data.level);
      expect(updatedTalk?.speakers[0].id).toEqual(speaker.id);

      const proposal = await db.proposal.findFirst({ where: { talkId }, include: { legacySpeakers: true } });
      expect(proposal?.title).toEqual(data.title);
      expect(proposal?.abstract).toEqual(data.abstract);
      expect(proposal?.references).toEqual(data.references);
      expect(proposal?.isDraft).toEqual(true);
      expect(proposal?.eventId).toEqual(event.id);
      expect(proposal?.languages).toEqual(data.languages);
      expect(proposal?.level).toEqual(data.level);
      expect(proposal?.legacySpeakers[0].id).toEqual(speaker.id);
    });

    it('throws an error when talk not found', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.saveDraft('XXX', data)).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk not belong to the user', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const user = await userFactory();
      const submission = TalkSubmission.for(user.id, event.slug);
      await expect(submission.saveDraft(talk.id, data)).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when CFP is not open', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-past'] });
      const speaker = await userFactory();
      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.saveDraft('new', data)).rejects.toThrowError(CfpNotOpenError);
    });

    it('throws an error when event not found', async () => {
      const speaker = await userFactory();
      const data = {
        title: 'New title',
        abstract: 'New abstract',
        references: 'New reference',
        languages: ['en'],
        level: TalkLevel.ADVANCED,
      };

      const submission = TalkSubmission.for(speaker.id, 'XXX');
      await expect(submission.saveDraft('new', data)).rejects.toThrowError(EventNotFoundError);
    });
  });

  describe('#saveTracks', () => {
    it('set tracks of the proposal', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await TalkSubmission.for(speaker.id, event.slug).saveTracks(talk.id, {
        formats: [format.id],
        categories: [category.id],
      });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true, categories: true },
      });

      expect(updatedProposal?.formats.length).toBe(1);
      expect(updatedProposal?.formats[0].id).toBe(format.id);
      expect(updatedProposal?.categories.length).toBe(1);
      expect(updatedProposal?.categories[0].id).toBe(category.id);
    });

    it('removes tracks of the proposal', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({
        event,
        talk,
        attributes: {
          formats: { connect: [{ id: format.id }] },
          categories: { connect: [{ id: category.id }] },
        },
      });

      await TalkSubmission.for(speaker.id, event.slug).saveTracks(talk.id, {
        formats: [],
        categories: [],
      });

      const updatedProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { formats: true, categories: true },
      });

      expect(updatedProposal?.formats.length).toBe(0);
      expect(updatedProposal?.categories.length).toBe(0);
    });

    it('throws an error when proposal not found', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.saveTracks('XXX', { formats: [], categories: [] })).rejects.toThrowError(
        ProposalNotFoundError,
      );
    });
  });

  describe('#submit', () => {
    it('submit a proposal', async () => {
      const event = await eventFactory({
        traits: ['conference-cfp-open'],
        attributes: { name: 'Event 1', emailOrganizer: 'ben@email.com', emailNotifications: ['submitted'] },
      });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk: talk, traits: ['draft'] });

      await TalkSubmission.for(speaker.id, event.slug).submit(talk.id);

      const result = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(result?.isDraft).toEqual(false);
      expect(result?.deliberationStatus).toEqual('PENDING');

      expect(sendEmail.trigger).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          template: 'speakers/proposal-submitted',
          to: [speaker.email],
        }),
      );

      expect(sendEmail.trigger).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          template: 'organizers/proposal-submitted',
          to: [event.emailOrganizer],
        }),
      );

      expect(sendSubmittedTalkSlackMessageMock).not.toHaveBeenCalled();
    });

    it('can submit if more drafts than event max proposals', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { maxProposals: 1 } });
      const speaker = await userFactory();
      const talk1 = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk: talk1, traits: ['draft'] });
      const talk2 = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk: talk2, traits: ['draft'] });

      await TalkSubmission.for(speaker.id, event.slug).submit(talk2.id);

      const result = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(result?.isDraft).toEqual(false);
      expect(result?.deliberationStatus).toEqual('PENDING');
    });

    it('triggers slack integration', async () => {
      const event = await eventFactory({
        traits: ['conference-cfp-open'],
        attributes: { slackWebhookUrl: 'http://webhook.example.net' },
      });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk: talk, traits: ['draft'] });

      await TalkSubmission.for(speaker.id, event.slug).submit(talk.id);

      expect(sendSubmittedTalkSlackMessageMock).toHaveBeenCalledWith(event.id, proposal.id);
    });

    it('throws an error when max proposal submitted reach', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'], attributes: { maxProposals: 1 } });
      const speaker = await userFactory();
      const talk1 = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk: talk1 });
      const talk2 = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk: talk2, traits: ['draft'] });

      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.submit(talk2.id)).rejects.toThrowError(MaxSubmittedProposalsReachedError);
    });

    it('throws an error when talk not belong to the user', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['draft'] });

      const user = await userFactory();
      const submission = TalkSubmission.for(user.id, event.slug);
      await expect(submission.submit(talk.id)).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws an error when CFP is not open', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-past'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const submission = TalkSubmission.for(speaker.id, event.slug);
      await expect(submission.submit(talk.id)).rejects.toThrowError(CfpNotOpenError);
    });

    it('throws an error when event not found', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const submission = TalkSubmission.for(speaker.id, 'XXX');
      await expect(submission.submit(talk.id)).rejects.toThrowError(EventNotFoundError);
    });
  });

  describe('#get', () => {
    it('returns info about the proposal submitted on event', async () => {
      const event = await eventFactory();
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });
      const speaker = await userFactory();
      const speaker2 = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, speaker2] });
      const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category] });

      const result = await TalkSubmission.for(speaker.id, event.slug).get(talk.id);

      expect(result).toEqual({
        id: proposal.id,
        title: proposal.title,
        abstract: proposal.abstract,
        languages: proposal.languages,
        level: proposal.level,
        references: proposal.references,
        invitationLink: `${process.env.APP_URL}/invite/proposal/${proposal.invitationCode}`,
        createdAt: proposal.createdAt,
        isOwner: true,
        speakers: [
          { id: speaker.id, name: speaker.name, bio: speaker.bio, picture: speaker.picture, isCurrentUser: true },
          { id: speaker2.id, name: speaker2.name, bio: speaker2.bio, picture: speaker2.picture, isCurrentUser: false },
        ],
        formats: [{ id: format.id, name: format.name }],
        categories: [{ id: category.id, name: category.name }],
      });
    });

    it('throws an error if talk does not have proposal for the event', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      await expect(TalkSubmission.for(speaker.id, event.slug).get(talk.id)).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws an error if proposal does not belong to user', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk });

      const user = await userFactory();
      await expect(TalkSubmission.for(user.id, event.slug).get(talk.id)).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('#removeCoSpeaker', () => {
    it('removes a cospeaker from the proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, cospeaker] });
      const proposal = await proposalFactory({ event, talk });

      await TalkSubmission.for(speaker.id, event.slug).removeCoSpeaker(talk.id, cospeaker.id);

      const proposalUpdated = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { legacySpeakers: true },
      });

      const speakers = proposalUpdated?.legacySpeakers.map(({ id }) => id);
      expect(speakers?.length).toBe(1);
      expect(speakers).toContain(speaker.id);
    });

    it('throws an error when talk doesnt belong to the speaker', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, cospeaker] });
      await proposalFactory({ event, talk });

      const updater = await userFactory();
      await expect(
        TalkSubmission.for(updater.id, event.slug).removeCoSpeaker(talk.id, cospeaker.id),
      ).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws an error when talk not found', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();

      const cospeaker = await userFactory();
      await expect(
        TalkSubmission.for(speaker.id, event.slug).removeCoSpeaker('XXX', cospeaker.id),
      ).rejects.toThrowError(ProposalNotFoundError);
    });
  });
});
