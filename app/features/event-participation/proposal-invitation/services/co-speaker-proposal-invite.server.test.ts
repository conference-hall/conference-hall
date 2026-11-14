import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import {
  CfpNotOpenError,
  InvitationNotFoundError,
  MaxSpeakersPerProposalReachedError,
} from '~/shared/errors.server.ts';
import { resolveStorageUrl } from '~/shared/storage/storage-utils.ts';
import { db } from '../../../../../prisma/db.server.ts';
import { CoSpeakerProposalInvite } from './co-speaker-proposal-invite.server.ts';

describe('CoSpeakerProposalInvite', () => {
  describe('#check', () => {
    it('returns the proposal for an invitation code', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const result = await CoSpeakerProposalInvite.with(proposal.invitationCode).check();

      expect(result).toEqual({
        id: proposal.id,
        title: proposal.title,
        description: proposal.abstract,
        speakers: [{ name: speaker.name, picture: speaker.picture }],
        maxSpeakersReached: false,
        canEdit: true,
        event: {
          id: proposal.event.id,
          name: proposal.event.name,
          slug: proposal.event.slug,
          type: proposal.event.type,
          logoUrl: resolveStorageUrl(proposal.event.logo),
          cfpState: proposal.event.cfpState,
          cfpStart: proposal.event.cfpStart,
          cfpEnd: proposal.event.cfpEnd,
        },
      });
    });

    it('tells when the proposal has reached the max speakers per proposal', async () => {
      const event = await eventFactory({ attributes: { maxSpeakersPerProposal: 1 } });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const result = await CoSpeakerProposalInvite.with(proposal.invitationCode).check();

      expect(result.maxSpeakersReached).toBe(true);
    });

    it('tells when a submitted proposal cannot be joined because the CFP is not open', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-past'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const result = await CoSpeakerProposalInvite.with(proposal.invitationCode).check();

      expect(result.canEdit).toBe(false);
    });

    it('returns throws an error when invitation code not found', async () => {
      await expect(CoSpeakerProposalInvite.with('XXX').check()).rejects.toThrow(InvitationNotFoundError);
    });
  });

  describe('#addCoSpeaker', () => {
    it('adds the speaker to the proposal and the talk', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-open'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const cospeaker = await userFactory();

      const result = await CoSpeakerProposalInvite.with(proposal.invitationCode).addCoSpeaker(cospeaker.id);

      const resultProposal = await db.proposal.findUnique({
        where: { id: proposal.id },
        include: { speakers: true, talk: { include: { speakers: true } } },
      });

      expect(result?.event.slug).toEqual(event.slug);
      expect(result?.id).toEqual(proposal.id);

      const speakersProposal = resultProposal?.speakers.map(({ userId }) => userId);
      expect(speakersProposal?.length).toBe(2);
      expect(speakersProposal).toContain(speaker.id);
      expect(speakersProposal).toContain(cospeaker.id);

      const speakersTalk = resultProposal?.talk?.speakers.map(({ id }) => id);
      expect(speakersTalk?.length).toBe(2);
      expect(speakersTalk).toContain(speaker.id);
      expect(speakersTalk).toContain(cospeaker.id);
    });

    it('adds the speaker to a draft proposal when CFP is not open', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-past'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['draft'] });
      const cospeaker = await userFactory();

      await CoSpeakerProposalInvite.with(proposal.invitationCode).addCoSpeaker(cospeaker.id);

      const result = await CoSpeakerProposalInvite.with(proposal.invitationCode).check();
      expect(result.speakers).toHaveLength(2);
    });

    it('adds the speaker to a submitted proposal when CFP is not open and speakers can edit after CFP close', async () => {
      const event = await eventFactory({
        traits: ['conference-cfp-past'],
        attributes: { speakersCanEditAfterCfpClose: true },
      });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const cospeaker = await userFactory();

      await CoSpeakerProposalInvite.with(proposal.invitationCode).addCoSpeaker(cospeaker.id);

      const result = await CoSpeakerProposalInvite.with(proposal.invitationCode).check();
      expect(result.speakers).toHaveLength(2);
    });

    it('throws an error when joining a submitted proposal while CFP is not open', async () => {
      const event = await eventFactory({ traits: ['conference-cfp-past'] });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const cospeaker = await userFactory();

      await expect(CoSpeakerProposalInvite.with(proposal.invitationCode).addCoSpeaker(cospeaker.id)).rejects.toThrow(
        CfpNotOpenError,
      );
    });

    it('throws an error when the proposal has reached the max speakers per proposal', async () => {
      const event = await eventFactory({
        traits: ['conference-cfp-open'],
        attributes: { maxSpeakersPerProposal: 1 },
      });
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const cospeaker = await userFactory();

      await expect(CoSpeakerProposalInvite.with(proposal.invitationCode).addCoSpeaker(cospeaker.id)).rejects.toThrow(
        MaxSpeakersPerProposalReachedError,
      );
    });

    it('returns throws an error when invitation code not found', async () => {
      const speaker = await userFactory();
      await expect(CoSpeakerProposalInvite.with('XXX').addCoSpeaker(speaker.id)).rejects.toThrow(
        InvitationNotFoundError,
      );
    });
  });
});
