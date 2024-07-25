import { db } from 'prisma/db.server.ts';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { CfpNotOpenError, ProposalNotFoundError } from '~/libs/errors.server.ts';
import { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { UserProposal } from './user-proposal.ts';

describe('UserProposal', () => {
  describe('#get', () => {
    it('returns an event proposal submitted by the user', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });

      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, formats: [format], categories: [category] });

      const result = await UserProposal.for(speaker.id, proposal.id).get();

      expect(result).toEqual({
        id: proposal.id,
        talkId: proposal.talkId,
        title: proposal.title,
        abstract: proposal.abstract,
        references: proposal.references,
        level: proposal.level,
        createdAt: proposal.createdAt.toISOString(),
        languages: proposal.languages,
        invitationLink: `http://127.0.0.1:3000/invite/proposal/${proposal.invitationCode}`,
        status: SpeakerProposalStatus.Submitted,
        formats: [{ id: format.id, name: format.name }],
        categories: [{ id: category.id, name: category.name }],
        isOwner: true,
        speakers: [
          {
            id: speaker.id,
            name: speaker.name,
            bio: speaker.bio,
            picture: speaker.picture,
            company: speaker.company,
            isCurrentUser: true,
          },
        ],
      });
    });

    it('throws an error when the proposal does not exist', async () => {
      const speaker = await userFactory();

      const speakerProposal = UserProposal.for(speaker.id, 'XXX');
      await expect(speakerProposal.get()).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws an error when the proposal does not belong to the user', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const otherSpeaker = await userFactory();
      const talk = await talkFactory({ speakers: [otherSpeaker] });
      const proposal = await proposalFactory({ event, talk });

      const speakerProposal = UserProposal.for(speaker.id, proposal.id);
      await expect(speakerProposal.get()).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('#update', () => {
    it('updates the proposal and the related talk', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const format = await eventFormatFactory({ event });
      const category = await eventCategoryFactory({ event });

      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await UserProposal.for(speaker.id, proposal.id).update({
        title: 'Title changed',
        abstract: 'Abstract changes',
        level: 'INTERMEDIATE',
        languages: ['be'],
        references: 'Reference changed',
        formats: [format.id],
        categories: [category.id],
      });

      const result = await UserProposal.for(speaker.id, proposal.id).get();

      expect(result.title).toEqual('Title changed');
      expect(result.abstract).toEqual('Abstract changes');
      expect(result.level).toEqual('INTERMEDIATE');
      expect(result.languages).toEqual(['be']);
      expect(result.references).toEqual('Reference changed');
      expect(result.formats[0].id).toEqual(format.id);
      expect(result.categories[0].id).toEqual(category.id);
    });

    it('throws an error when CFP is not open', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-past'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await expect(
        UserProposal.for(speaker.id, proposal.id).update({
          title: 'change',
          abstract: 'change',
          level: null,
          languages: ['fr'],
          references: '',
          formats: [],
          categories: [],
        }),
      ).rejects.toThrowError(CfpNotOpenError);
    });

    it('throws an error when proposal not found', async () => {
      const speaker = await userFactory();

      await expect(
        UserProposal.for(speaker.id, 'XXX').update({
          title: 'change',
          abstract: 'change',
          level: null,
          languages: ['fr'],
          references: '',
          formats: [],
          categories: [],
        }),
      ).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws an error when proposal does not belong to user', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const otherSpeaker = await userFactory();
      const talk = await talkFactory({ speakers: [otherSpeaker] });
      const proposal = await proposalFactory({ event, talk });

      await expect(
        UserProposal.for(speaker.id, proposal.id).update({
          title: 'change',
          abstract: 'change',
          level: null,
          languages: ['fr'],
          references: '',
          formats: [],
          categories: [],
        }),
      ).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('#removeCoSpeaker', () => {
    it('removes a cospeaker from the proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, cospeaker] });
      const proposal = await proposalFactory({ event, talk });

      await UserProposal.for(speaker.id, proposal.id).removeCoSpeaker(cospeaker.id);

      const proposalUpdated = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { speakers: true },
      });

      const speakers = proposalUpdated?.speakers.map(({ id }) => id);
      expect(speakers?.length).toBe(1);
      expect(speakers).toContain(speaker.id);
    });

    it('throws an error when proposal doesnt belong to the speaker', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const cospeaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker, cospeaker] });
      const proposal = await proposalFactory({ event, talk });

      const updater = await userFactory();
      await expect(UserProposal.for(updater.id, proposal.id).removeCoSpeaker(cospeaker.id)).rejects.toThrowError(
        ProposalNotFoundError,
      );
    });

    it('throws an error when proposal not found', async () => {
      const speaker = await userFactory();
      const cospeaker = await userFactory();
      await expect(UserProposal.for(speaker.id, 'XXX').removeCoSpeaker(cospeaker.id)).rejects.toThrowError(
        ProposalNotFoundError,
      );
    });
  });

  describe('#delete', () => {
    it('deletes a proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await UserProposal.for(speaker.id, proposal.id).delete();

      const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

      expect(deleted).toBe(null);
    });

    it('does not delete a proposal if not belonging to user', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const otherSpeaker = await userFactory();
      const talk = await talkFactory({ speakers: [otherSpeaker] });
      const proposal = await proposalFactory({ event, talk });

      await UserProposal.for(speaker.id, proposal.id).delete();

      const deleted = await db.proposal.findUnique({ where: { id: proposal.id } });

      expect(deleted).not.toBe(1);
    });
  });

  describe('#confirm', () => {
    it('confirms a proposal', async () => {
      const event = await eventFactory({
        attributes: { name: 'Event 1', emailOrganizer: 'ben@email.com', emailNotifications: ['confirmed'] },
      });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['accepted-published'] });

      await UserProposal.for(speaker.id, proposal.id).confirm('CONFIRMED');

      const proposalUpdated = await db.proposal.findUnique({
        where: { id: proposal.id },
      });

      expect(proposalUpdated?.confirmationStatus).toBe('CONFIRMED');

      expect([
        {
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: [event.emailOrganizer!],
          subject: `[${event.name}] Talk confirmed by speaker`,
        },
      ]).toHaveEmailsEnqueued();
    });

    it('declines a proposal', async () => {
      const event = await eventFactory({
        attributes: { name: 'Event 1', emailOrganizer: 'ben@email.com', emailNotifications: ['declined'] },
      });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['accepted-published'] });

      await UserProposal.for(speaker.id, proposal.id).confirm('DECLINED');

      const proposalUpdated = await db.proposal.findUnique({
        where: { id: proposal.id },
      });

      expect(proposalUpdated?.confirmationStatus).toBe('DECLINED');

      expect([
        {
          from: `${event.name} <no-reply@conference-hall.io>`,
          to: [event.emailOrganizer!],
          subject: `[${event.name}] Talk declined by speaker`,
        },
      ]).toHaveEmailsEnqueued();
    });

    it('cannot confirm or declined a not accepted proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      await UserProposal.for(speaker.id, proposal.id).confirm('CONFIRMED');

      const proposalUpdated = await db.proposal.findUnique({
        where: { id: proposal.id },
      });

      expect(proposalUpdated?.confirmationStatus).toBeNull();
    });

    it('cannot confirm or declined a not published proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

      await UserProposal.for(speaker.id, proposal.id).confirm('CONFIRMED');

      const proposalUpdated = await db.proposal.findUnique({
        where: { id: proposal.id },
      });

      expect(proposalUpdated?.confirmationStatus).toBeNull();
    });

    it('throws an error when proposal not found', async () => {
      const speaker = await userFactory();
      await expect(UserProposal.for(speaker.id, 'XXX').confirm('CONFIRMED')).rejects.toThrowError(
        ProposalNotFoundError,
      );
    });
  });
});
