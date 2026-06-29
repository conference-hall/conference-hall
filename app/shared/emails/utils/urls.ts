import { href } from 'react-router';
import { getSharedServerEnv } from '../../../../servers/environment.server.ts';

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

export function buildAdminRequestsUrl() {
  return `${APP_URL}${href('/admin/requests')}`;
}

export function buildUnsubscribeUrl(token: string) {
  return `${APP_URL}${href('/unsubscribe')}?token=${encodeURIComponent(token)}`;
}

// "Open" link for a conversation-digest line. The destination depends on the recipient's role:
// speakers land on their proposal page, organizers on the event-management proposal page. The
// `thread` selects which conversation drawer auto-opens (see the `?conversation=` deep-link).
export function buildConversationDigestUrl(args: {
  role: 'SPEAKER' | 'ORGANIZER';
  thread: 'speaker' | 'review';
  teamSlug: string;
  eventSlug: string;
  proposalId: string;
}) {
  const base =
    args.role === 'SPEAKER'
      ? buildSpeakerProposalUrl(args.eventSlug, args.proposalId)
      : buildReviewProposalUrl(args.teamSlug, args.eventSlug, args.proposalId);

  return `${base}?conversation=${args.thread}`;
}
