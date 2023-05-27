import { Avatar } from '~/design-system/Avatar';
import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card';
import { Link } from '~/design-system/Links';
import { H3, Text } from '~/design-system/Typography';
import type { SpeakerProposalStatus } from '~/server/proposals/get-speaker-proposal-status';

import { ProposalStatusLabel } from './ProposalStatusLabel';

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
        <ul className="mt-4 space-y-4">
          {submissions.map((submission) => (
            <li key={submission.slug} className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Avatar picture={submission.logo} name={submission.name} square size="xs" aria-hidden />
                <Link to={`/${submission.slug}/proposals`} strong heading truncate>
                  {submission.name}
                </Link>
              </div>
              <ProposalStatusLabel status={submission.proposalStatus} />
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
