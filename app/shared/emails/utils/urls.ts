import { href } from 'react-router';
import { getSharedServerEnv } from 'servers/environment.server.ts';

const env = getSharedServerEnv();

export function buildSpeakerProfileUrl() {
  return `${env.APP_URL}${href('/speaker/settings/profile')}`;
}

export function buildSpeakerProposalUrl(event: string, proposal: string) {
  return `${env.APP_URL}${href('/:event/proposals/:proposal', { event, proposal })}`;
}

export function buildReviewProposalUrl(team: string, event: string, proposal: string) {
  return `${env.APP_URL}${href('/team/:team/:event/reviews/:proposal', { team, event, proposal })}`;
}
