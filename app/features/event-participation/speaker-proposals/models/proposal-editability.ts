type ProposalEditability = {
  isDraft: boolean;
  event: { isCfpOpen: boolean; speakersCanEditAfterCfpClose: boolean };
};

export function canEdit({ isDraft, event }: ProposalEditability) {
  return !isDraft && (event.isCfpOpen || event.speakersCanEditAfterCfpClose);
}

export function canDelete({ isDraft, event }: ProposalEditability) {
  return isDraft || event.isCfpOpen;
}

export function canAcceptInvitation({ isDraft, event }: ProposalEditability) {
  return isDraft || event.isCfpOpen || event.speakersCanEditAfterCfpClose;
}
