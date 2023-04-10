import { Card } from '~/design-system/Card';
import { H3, Text } from '~/design-system/Typography';
import { ProposalStatusLabel } from './ProposalStatusLabel';
import { Link } from '~/design-system/Links';
import { ButtonLink } from '~/design-system/Buttons';
import type { SpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';

type Props = {
  talkId: string;
  submissions: Array<{ slug: string; name: string; proposalStatus: SpeakerProposalStatus }>;
};

export function ProposalSubmissionsSection({ talkId, submissions }: Props) {
  return (
    <Card as="section" rounded="lg" p={8} className="space-y-6">
      <H3 mb={0}>Submissions</H3>
      {submissions.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {submissions.map((submission) => (
            <li key={submission.slug} className="flex items-center gap-2">
              <ProposalStatusLabel status={submission.proposalStatus} />
              <Text size="s" variant="secondary">
                —
              </Text>
              <Link to={`/${submission.slug}/proposals`}>
                <Text size="s" variant="link" strong truncate>
                  {submission.name}
                </Text>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="s" variant="secondary">
          No submissions yet.
        </Text>
      )}

      <ButtonLink to={`/?talkId=${talkId}`} block>
        Submit talk
      </ButtonLink>
    </Card>
  );
}
