import { Link } from '@remix-run/react';

import { Avatar } from '~/design-system/Avatar.tsx';
import { ButtonLink } from '~/design-system/Buttons.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { H3, Text } from '~/design-system/Typography.tsx';
import type { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { ProposalStatusLabel } from './ProposalStatusLabel.tsx';

type Props = {
  talkId: string;
  submissions: Array<{
    slug: string;
    name: string;
    logo: string | null;
    proposalStatus: SpeakerProposalStatus;
  }>;
};

export function ProposalSubmissionsSection({ talkId, submissions }: Props) {
  return (
    <Card as="section" p={8} className="space-y-6">
      <H3>Submissions</H3>
      {submissions.length > 0 ? (
        <ul className="flex gap-4">
          {submissions.map((submission) => (
            <li key={submission.slug}>
              <Link to={`/${submission.slug}/proposals`} className="flex gap-2 hover:bg-gray-100 p-2 rounded-md">
                <Avatar picture={submission.logo} name={submission.name} square size="m" aria-hidden />
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

      <ButtonLink to={`/?talkId=${talkId}`} block>
        Submit talk
      </ButtonLink>
    </Card>
  );
}
