import { vi } from 'vitest';

import { getSpeakerProposalStatus, SpeakerProposalStatus } from './get-speaker-proposal-status';

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
      { status: 'DRAFT', emailAcceptedStatus: null, emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: new Date('2019-02-26T00:00:00.000Z'), cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.Draft);
  });

  it('returns Submitted status when proposal submitted and cfp is open', () => {
    const status = getSpeakerProposalStatus(
      { status: 'SUBMITTED', emailAcceptedStatus: null, emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: new Date('2019-02-26T00:00:00.000Z'), cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.Submitted);
  });

  it('returns DeliberationPending status when proposal submitted and cfp is closed', () => {
    const status = getSpeakerProposalStatus(
      { status: 'SUBMITTED', emailAcceptedStatus: null, emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal accepted and speaker not notified', () => {
    const status = getSpeakerProposalStatus(
      { status: 'ACCEPTED', emailAcceptedStatus: null, emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal rejected and speaker not notified', () => {
    const status = getSpeakerProposalStatus(
      { status: 'REJECTED', emailAcceptedStatus: null, emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns AcceptedByOrganizers status when proposal accepted and speaker notified', () => {
    const status = getSpeakerProposalStatus(
      { status: 'ACCEPTED', emailAcceptedStatus: 'SENT', emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.AcceptedByOrganizers);
  });

  it('returns RejectedByOrganizers status when proposal accepted and speaker notified', () => {
    const status = getSpeakerProposalStatus(
      { status: 'REJECTED', emailAcceptedStatus: null, emailRejectedStatus: 'SENT' },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.RejectedByOrganizers);
  });

  it('returns ConfirmedBySpeaker status when proposal confirmed by speaker', () => {
    const status = getSpeakerProposalStatus(
      { status: 'CONFIRMED', emailAcceptedStatus: null, emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.ConfirmedBySpeaker);
  });

  it('returns DeclinedBySpeaker status when proposal declined by speaker', () => {
    const status = getSpeakerProposalStatus(
      { status: 'DECLINED', emailAcceptedStatus: null, emailRejectedStatus: null },
      { type: 'MEETUP', cfpStart: null, cfpEnd: null }
    );
    expect(status).toBe(SpeakerProposalStatus.DeclinedBySpeaker);
  });
});
