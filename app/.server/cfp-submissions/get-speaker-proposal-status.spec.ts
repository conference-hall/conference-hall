import { SpeakerProposalStatus } from '~/types/speaker.types.ts';
import { getSpeakerProposalStatus } from './get-speaker-proposal-status.ts';

describe('getSpeakerProposalStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns Draft status when proposal is in draft', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'PENDING',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: true,
      },
      {
        type: 'MEETUP',
        cfpStart: new Date('2019-02-26T00:00:00.000Z'),
        cfpEnd: null,
      },
    );
    expect(status).toBe(SpeakerProposalStatus.Draft);
  });

  it('returns Submitted status when proposal submitted and cfp is open', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'PENDING',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
      {
        type: 'MEETUP',
        cfpStart: new Date('2019-02-26T00:00:00.000Z'),
        cfpEnd: null,
      },
    );
    expect(status).toBe(SpeakerProposalStatus.Submitted);
  });

  it('returns DeliberationPending status when proposal submitted and cfp is closed', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'PENDING',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null },
    );
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal accepted and speaker not notified', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null },
    );
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal rejected and speaker not notified', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'REJECTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null },
    );
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns AcceptedByOrganizers status when proposal accepted and speaker notified', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'PUBLISHED',
        isDraft: false,
      },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null },
    );
    expect(status).toBe(SpeakerProposalStatus.AcceptedByOrganizers);
  });

  it('returns RejectedByOrganizers status when proposal accepted and speaker notified', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'REJECTED',
        confirmationStatus: 'PENDING',
        publicationStatus: 'PUBLISHED',
        isDraft: false,
      },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null },
    );
    expect(status).toBe(SpeakerProposalStatus.RejectedByOrganizers);
  });

  it('returns ConfirmedBySpeaker status when proposal confirmed by speaker', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'CONFIRMED',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null },
    );
    expect(status).toBe(SpeakerProposalStatus.ConfirmedBySpeaker);
  });

  it('returns DeclinedBySpeaker status when proposal declined by speaker', () => {
    const status = getSpeakerProposalStatus(
      {
        deliberationStatus: 'ACCEPTED',
        confirmationStatus: 'DECLINED',
        publicationStatus: 'NOT_PUBLISHED',
        isDraft: false,
      },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null },
    );
    expect(status).toBe(SpeakerProposalStatus.DeclinedBySpeaker);
  });
});
