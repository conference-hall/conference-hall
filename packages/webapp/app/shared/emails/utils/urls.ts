import { href } from 'react-router';
import { getSharedServerEnv } from '../../../../../shared/src/environment/environment.ts';

const { APP_URL } = getSharedServerEnv();

export function buildSpeakerProfileUrl() {
  return `${APP_URL}${href('/speaker/settings/profile')}`;
}

export function buildSpeakerProposalUrl(event: string, proposal: string) {
  return `${APP_URL}${href('/:event/proposals/:proposal', { event, proposal })}`;
}

export function buildReviewProposalUrl(team: string, event: string, proposal: string) {
  return `${APP_URL}${href('/team/:team/:event/proposals/:proposal', { team, event, proposal })}`;
}
