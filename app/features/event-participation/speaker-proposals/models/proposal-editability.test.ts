import { canDelete, canEdit, canJoin } from './proposal-editability.ts';

const openCfp = { isCfpOpen: true, speakersCanEditAfterCfpClose: false };
const closedCfp = { isCfpOpen: false, speakersCanEditAfterCfpClose: false };
const closedCfpWithEditing = { isCfpOpen: false, speakersCanEditAfterCfpClose: true };

describe('canEdit', () => {
  it('is true for a submitted proposal when the CFP is open', () => {
    expect(canEdit({ isDraft: false, event: openCfp })).toBe(true);
  });

  it('is false for a submitted proposal when the CFP is closed', () => {
    expect(canEdit({ isDraft: false, event: closedCfp })).toBe(false);
  });

  it('is true for a submitted proposal when the CFP is closed and speakers can edit after CFP close', () => {
    expect(canEdit({ isDraft: false, event: closedCfpWithEditing })).toBe(true);
  });

  it('is false for a draft', () => {
    expect(canEdit({ isDraft: true, event: openCfp })).toBe(false);
  });
});

describe('canDelete', () => {
  it('is true for a draft when the CFP is closed', () => {
    expect(canDelete({ isDraft: true, event: closedCfp })).toBe(true);
  });

  it('is true for a submitted proposal when the CFP is open', () => {
    expect(canDelete({ isDraft: false, event: openCfp })).toBe(true);
  });

  it('is false for a submitted proposal when the CFP is closed, even if speakers can edit after CFP close', () => {
    expect(canDelete({ isDraft: false, event: closedCfpWithEditing })).toBe(false);
  });
});

describe('canJoin', () => {
  it('is true for a draft when the CFP is closed', () => {
    expect(canJoin({ isDraft: true, event: closedCfp })).toBe(true);
  });

  it('is false for a submitted proposal when the CFP is closed', () => {
    expect(canJoin({ isDraft: false, event: closedCfp })).toBe(false);
  });

  it('is true for a submitted proposal when the CFP is closed and speakers can edit after CFP close', () => {
    expect(canJoin({ isDraft: false, event: closedCfpWithEditing })).toBe(true);
  });
});
