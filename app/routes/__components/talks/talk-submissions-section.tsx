import { Link } from '@remix-run/react';

import { Avatar } from '~/design-system/avatar.tsx';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H3, Text } from '~/design-system/typography.tsx';
import type { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { ProposalStatusLabel } from '../proposals/proposal-status-label.tsx';

type Props = {
  talkId: string;
  canSubmit: boolean;
  submissions: Array<{
    slug: string;
    name: string;
    logoUrl: string | null;
    proposalStatus: SpeakerProposalStatus;
  }>;
};

export function TalkSubmissionsSection({ talkId, canSubmit, submissions }: Props) {
  return (
    <Card as="section" className="p-6 space-y-6">
      <H3>Submissions</H3>

      {submissions.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {submissions.map((submission) => (
            <li key={submission.slug}>
              <Link
                to={`/${submission.slug}/proposals`}
                aria-label={`Go to ${submission.name}`}
                className="flex gap-2 w-full hover:bg-gray-100 p-2 rounded-md"
              >
                <Avatar picture={submission.logoUrl} name={submission.name} square size="m" aria-hidden />
                <div className="flex flex-col gap-0.5 truncate">
                  <Text weight="medium" truncate>
                    {submission.name}
                  </Text>
                  <ProposalStatusLabel status={submission.proposalStatus} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Text variant="secondary">No submissions yet.</Text>
      )}

      {canSubmit && (
        <ButtonLink to={`/?talkId=${talkId}`} block>
          Submit talk
        </ButtonLink>
      )}
    </Card>
  );
}
