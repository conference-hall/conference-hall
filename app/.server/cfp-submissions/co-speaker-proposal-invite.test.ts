import { db } from 'prisma/db.server.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { InvitationNotFoundError } from '~/libs/errors.server.ts';

import { CoSpeakerProposalInvite } from './co-speaker-proposal-invite.ts';

describe('CoSpeakerProposalInvite', () => {
  describe('#check', () => {
    it('returns the proposal for an invitation code', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const result = await CoSpeakerProposalInvite.with(proposal.invitationCode).check();

      expect(result).toEqual({
        id: proposal.id,
        title: proposal.title,
        description: proposal.abstract,
        speakers: [{ id: speaker.id, name: speaker.name, picture: speaker.picture }],
        event: {
          name: proposal.event.name,
          slug: proposal.event.slug,
          type: proposal.event.type,
          logo: proposal.event.logo,
          cfpState: proposal.event.cfpState,
          cfpStart: proposal.event.cfpStart,
          cfpEnd: proposal.event.cfpEnd,
        },
      });
    });

    it('returns throws an error when invitation code not found', async () => {
      await expect(CoSpeakerProposalInvite.with('XXX').check()).rejects.toThrowError(InvitationNotFoundError);
    });
  });

  describe('#addCoSpeaker', () => {
    it('adds the speaker to the proposal and the talk', async () => {
      const event = await eventFactory();
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

      const speakersProposal = resultProposal?.speakers.map(({ id }) => id);
      expect(speakersProposal?.length).toBe(2);
      expect(speakersProposal).toContain(speaker.id);
      expect(speakersProposal).toContain(cospeaker.id);

      const speakersTalk = resultProposal?.talk?.speakers.map(({ id }) => id);
      expect(speakersTalk?.length).toBe(2);
      expect(speakersTalk).toContain(speaker.id);
      expect(speakersTalk).toContain(cospeaker.id);
    });

    it('returns throws an error when invitation code not found', async () => {
      const speaker = await userFactory();
      await expect(CoSpeakerProposalInvite.with('XXX').addCoSpeaker(speaker.id)).rejects.toThrowError(
        InvitationNotFoundError,
      );
    });
  });
});
