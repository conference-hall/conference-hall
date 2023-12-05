import { getSpeakerProposalStatus, SpeakerProposalStatus } from './get-speaker-proposal-status.ts';

describe('getSpeakerProposalStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-02-26T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns Draft status when proposal is in draft', () => {
    const status = getSpeakerProposalStatus('PENDING', 'PENDING', true, false);
    expect(status).toBe(SpeakerProposalStatus.Draft);
  });

  it('returns DeliberationPending status when results not published', () => {
    const status = getSpeakerProposalStatus('PENDING', 'PENDING', false, false);
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal accepted and results not published', () => {
    const status = getSpeakerProposalStatus('ACCEPTED', 'PENDING', false, false);
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns DeliberationPending status when proposal rejected and results not published', () => {
    const status = getSpeakerProposalStatus('REJECTED', 'PENDING', false, false);
    expect(status).toBe(SpeakerProposalStatus.DeliberationPending);
  });

  it('returns AcceptedByOrganizers status when proposal accepted and results published', () => {
    const status = getSpeakerProposalStatus('ACCEPTED', 'PENDING', false, true);
    expect(status).toBe(SpeakerProposalStatus.AcceptedByOrganizers);
  });

  it('returns RejectedByOrganizers status when proposal rejected and results published', () => {
    const status = getSpeakerProposalStatus('REJECTED', 'PENDING', false, true);
    expect(status).toBe(SpeakerProposalStatus.RejectedByOrganizers);
  });

  it('returns ConfirmedBySpeaker status when proposal confirmed by speaker', () => {
    const status = getSpeakerProposalStatus('ACCEPTED', 'CONFIRMED', false, true);
    expect(status).toBe(SpeakerProposalStatus.ConfirmedBySpeaker);
  });

  it('returns DeclinedBySpeaker status when proposal declined by speaker', () => {
    const status = getSpeakerProposalStatus('ACCEPTED', 'DECLINED', false, true);
    expect(status).toBe(SpeakerProposalStatus.DeclinedBySpeaker);
  });
});
