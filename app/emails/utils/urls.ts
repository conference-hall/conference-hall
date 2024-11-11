const APP_URL = process.env.APP_URL;

export function buildSpeakerProfileUrl() {
  return `${APP_URL}/speaker/profile`;
}

export function buildSpeakerProposalUrl(eventSlug: string, proposalId: string) {
  return `${APP_URL}/${eventSlug}/proposals/${proposalId}`;
}

export function buildReviewProposalUrl(teamSlug: string, eventSlug: string, proposalId: string) {
  return `${APP_URL}/team/${teamSlug}/${eventSlug}/reviews/${proposalId}`;
}
