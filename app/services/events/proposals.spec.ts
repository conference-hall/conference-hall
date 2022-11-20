import { getEmails, resetEmails } from 'tests/email-helpers';
import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventFactory } from '../../../tests/factories/events';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { ProposalNotFoundError } from '../errors';
import {
  isTalkAlreadySubmitted,
  removeCoSpeakerFromProposal,
  removeCoSpeakerFromTalkAndEvent,
  sendProposalParticipation,
} from './proposals.server';

describe('#isTalkAlreadySubmitted', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  it('returns true if the talk already submitted for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['submitted'] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeTruthy();
  });

  it('returns false if the talk is submitted as draft for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    await proposalFactory({ event, talk, traits: ['draft'] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeFalsy();
  });

  it('returns false if the talk is not submitted for the event', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeFalsy();
  });

  it('returns false if the submitted talk belongs to another speaker', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const otherSpeaker = await userFactory();
    const talk = await talkFactory({ speakers: [otherSpeaker] });
    await proposalFactory({ event, talk, traits: ['submitted'] });

    const result = await isTalkAlreadySubmitted(event.slug, talk.id, speaker.id);

    expect(result).toBeFalsy();
  });
});

describe('#removeCoSpeakerFromTalkAndEvent', () => {
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

    await removeCoSpeakerFromTalkAndEvent(speaker.id, talk.id, event.slug, cospeaker.id);

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
    await expect(removeCoSpeakerFromTalkAndEvent(updater.id, talk.id, event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });

  it('throws an error when talk not found', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromTalkAndEvent(speaker.id, 'XXX', event.slug, cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
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
      ProposalNotFoundError
    );
  });

  it('throws an error when talk not found', async () => {
    const speaker = await userFactory();

    const cospeaker = await userFactory();
    await expect(removeCoSpeakerFromProposal(speaker.id, 'XXX', cospeaker.id)).rejects.toThrowError(
      ProposalNotFoundError
    );
  });
});

describe('#sendProposalParticipation', () => {
  beforeEach(async () => {
    await resetEmails();
    await resetDB();
  });
  afterEach(disconnectDB);

  it('confirms a proposal', async () => {
    const event = await eventFactory({
      attributes: { emailOrganizer: 'ben@email.com', emailNotifications: ['confirmed'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendProposalParticipation(speaker.id, proposal.id, 'CONFIRMED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('CONFIRMED');

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Talk confirmed by speaker`,
      },
    ]);
  });

  it('declines a proposal', async () => {
    const event = await eventFactory({
      attributes: { emailOrganizer: 'ben@email.com', emailNotifications: ['declined'] },
    });
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });

    await sendProposalParticipation(speaker.id, proposal.id, 'DECLINED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('DECLINED');

    const emails = await getEmails();
    expect(emails.total).toBe(1);
    expect(emails.to(event.emailOrganizer)).toEqual([
      {
        from: `${event.name} <no-reply@conference-hall.io>`,
        subject: `[${event.name}] Talk declined by speaker`,
      },
    ]);
  });

  it('cannot confirm or declined a not accepted proposal', async () => {
    const event = await eventFactory();
    const speaker = await userFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['submitted'] });

    await sendProposalParticipation(speaker.id, proposal.id, 'CONFIRMED');

    const proposalUpdated = await db.proposal.findUnique({
      where: { id: proposal.id },
    });

    expect(proposalUpdated?.status).toBe('SUBMITTED');
  });

  it('throws an error when proposal not found', async () => {
    const speaker = await userFactory();
    await expect(sendProposalParticipation(speaker.id, 'XXX', 'CONFIRMED')).rejects.toThrowError(ProposalNotFoundError);
  });
});
