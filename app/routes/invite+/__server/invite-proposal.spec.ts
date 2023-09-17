import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';

import { db } from '~/libs/db.ts';
import { InvitationNotFoundError } from '~/libs/errors.ts';

import { addCoSpeakerToProposal, checkProposalInviteCode } from './invite-proposal.server.ts';

describe('#addCoSpeakerToProposal', () => {
  it('adds the speaker to the proposal and the talk', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });
    const cospeaker = await userFactory();

    const result = await addCoSpeakerToProposal(proposal.invitationCode, cospeaker.id);

    const resultProposal = await db.proposal.findUnique({
      where: { id: proposal.id },
      include: { speakers: true, talk: { include: { speakers: true } } },
    });

    expect(result?.eventSlug).toEqual(event.slug);
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
    await expect(addCoSpeakerToProposal('XXX', speaker.id)).rejects.toThrowError(InvitationNotFoundError);
  });
});

describe('#checkProposalInviteCode', () => {
  it('returns the proposal for an invitation code', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    const result = await checkProposalInviteCode(proposal.invitationCode);

    expect(result).toEqual({ id: proposal.id, title: proposal.title, eventSlug: event.slug });
  });

  it('returns throws an error when invitation code not found', async () => {
    await expect(checkProposalInviteCode('XXX')).rejects.toThrowError(InvitationNotFoundError);
  });
});
