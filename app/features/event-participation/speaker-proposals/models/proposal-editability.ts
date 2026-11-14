type ProposalWithCfpState = {
  isDraft: boolean;
  event: { isCfpOpen: boolean; speakersCanEditAfterCfpClose: boolean };
};

export function canEditSubmitted({ isDraft, event }: ProposalWithCfpState) {
  return !isDraft && (event.isCfpOpen || event.speakersCanEditAfterCfpClose);
}

export function canEdit(proposal: ProposalWithCfpState) {
  return proposal.isDraft || canEditSubmitted(proposal);
}

export function canDelete({ isDraft, event }: ProposalWithCfpState) {
  return isDraft || event.isCfpOpen;
}
