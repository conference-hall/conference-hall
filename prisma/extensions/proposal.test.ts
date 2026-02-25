import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { SpeakerProposalStatus } from '~/shared/types/speaker.types.ts';
import { getSharedServerEnv } from '../../servers/environment.server.ts';
import type { Event, Talk, User } from '../generated/client.ts';

const { APP_URL } = getSharedServerEnv();

describe('Proposal#routeId', () => {
  it('returns the proposal number when present', async () => {
    const speaker = await userFactory();
    const event = await eventFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    expect(proposal.routeId).toBe(`${proposal.proposalNumber}`);
  });

  it('returns the proposal id when proposal number is null', async () => {
    const speaker = await userFactory();
    const event = await eventFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk, traits: ['draft'] });

    expect(proposal.routeId).toBe(`${proposal.id}`);
  });
});

describe('Proposal#invitationLink', () => {
  it('returns the invitation link', async () => {
    const speaker = await userFactory();
    const event = await eventFactory();
    const talk = await talkFactory({ speakers: [speaker] });
    const proposal = await proposalFactory({ event, talk });

    expect(proposal.invitationLink).toBe(`${APP_URL}/invite/proposal/${proposal.invitationCode}`);
  });
});

describe('Proposal#getStatusForSpeaker', () => {
  let event: Event;
  let talk: Talk & { speakers: User[] };

  beforeEach(async () => {
    const speaker = await userFactory();
    event = await eventFactory();
    talk = await talkFactory({ speakers: [speaker] });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns Draft status when proposal is in draft', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'PENDING',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: true,
      },
    });
    expect(proposal.getStatusForSpeaker(true)).toBe(SpeakerProposalStatus.Draft);
  });

  it('returns Submitted status when proposal submitted and cfp is open', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'PENDING',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(true)).toBe(SpeakerProposalStatus.Submitted);
  });

  it('returns DeliberationPending status when proposal submitted and cfp is closed', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'PENDING',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(false)).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal accepted and speaker not notified', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(false)).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal rejected and speaker not notified', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'REJECTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(false)).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns AcceptedByOrganizers status when proposal accepted and speaker notified', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(false)).toBe(SpeakerProposalStatus.AcceptedByOrganizers);
  });

  it('returns RejectedByOrganizers status when proposal accepted and speaker notified', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'REJECTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(false)).toBe(SpeakerProposalStatus.RejectedByOrganizers);
  });

  it('returns ConfirmedBySpeaker status when proposal confirmed by speaker', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'CONFIRMED',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(false)).toBe(SpeakerProposalStatus.ConfirmedBySpeaker);
  });

  it('returns DeclinedBySpeaker status when proposal declined by speaker', async () => {
    const proposal = await proposalFactory({
      event,
      talk,
      attributes: {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'DECLINED',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
    });
    expect(proposal.getStatusForSpeaker(false)).toBe(SpeakerProposalStatus.DeclinedBySpeaker);
  });
});
