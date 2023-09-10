import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { describe, expect, it } from 'vitest';

import { db } from '../../../libs/db';
import { ProposalNotFoundError } from '../../../libs/errors';
import { removeCoSpeakerFromProposal, removeCoSpeakerFromSubmission } from './remove-co-speaker.server';

describe('#removeCoSpeakerFromSubmission', () => {
  it('removes a cospeaker from the proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    await removeCoSpeakerFromSubmission(speaker.id, talk.id, event.slug, cospeaker.id);

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
      include: { speakers: true },
    });

    const speakers = proposalUpdated?.speakers.map(({ id }) => id);
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
    await expect(removeCoSpeakerFromSubmission(updater.id, talk.id, event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError,
    );
  });

  it('throws an error when talk not found', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromSubmission(speaker.id, 'XXX', event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError,
    );
  });
});

describe('#removeCoSpeakerFromProposal', () => {
  it('removes a cospeaker from the proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    await removeCoSpeakerFromProposal(speaker.id, proposal.id, cospeaker.id);

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
      include: { speakers: true },
    });

    const speakers = proposalUpdated?.speakers.map(({ id }) => id);
    expect(speakers?.length).toBe(1);
    expect(speakers).toContain(speaker.id);
  });

  it('throws an error when talk doesnt belong to the speaker', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    const updater = await userFactory();
    await expect(removeCoSpeakerFromProposal(updater.id, proposal.id, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError,
    );
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromProposal(speaker.id, 'XXX', cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError,
    );
  });
});
