import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '~/services/db';
import { removeCoSpeakerFromProposal, removeCoSpeakerFromSubmission } from './remove-co-speaker-from-proposal.server';

describe('#removeCoSpeakerFromSubmission', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('removes a cospeaker from the proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    await removeCoSpeakerFromSubmission({
      speakerId: speaker.id,
      talkId: talk.id,
      eventSlug: event.slug,
      coSpeakerId: cospeaker.id,
    });

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
    const result = await removeCoSpeakerFromSubmission({
      speakerId: updater.id,
      talkId: talk.id,
      eventSlug: event.slug,
      coSpeakerId: cospeaker.id,
    });
    expect(result.errors[0].message).toEqual('Proposal not found');
  });

  it('throws an error when talk not found', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    const result = await removeCoSpeakerFromSubmission({
      speakerId: speaker.id,
      talkId: 'XXX',
      eventSlug: event.slug,
      coSpeakerId: cospeaker.id,
    });
    expect(result.errors[0].message).toEqual('Proposal not found');
  });
});

describe('#removeCoSpeakerFromProposal', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('removes a cospeaker from the proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker, cospeaker] });
    const proposal = await proposalFactory({ event, talk });

    await removeCoSpeakerFromProposal({ speakerId: speaker.id, proposalId: proposal.id, coSpeakerId: cospeaker.id });

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
    const result = await removeCoSpeakerFromProposal({
      speakerId: updater.id,
      proposalId: proposal.id,
      coSpeakerId: cospeaker.id,
    });
    expect(result.errors[0].message).toEqual('Proposal not found');
  });

  it('throws an error when proposal not found', async () => {
    const speaker = await userFactory();
    const cospeaker = await userFactory();
    const result = await removeCoSpeakerFromProposal({
      speakerId: speaker.id,
      proposalId: 'XXX',
      coSpeakerId: cospeaker.id,
    });
    expect(result.errors[0].message).toEqual('Proposal not found');
  });
});
