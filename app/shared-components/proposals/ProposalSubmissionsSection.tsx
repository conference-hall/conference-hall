import { Card } from '~/design-system/Card';
import { H3, Text } from '~/design-system/Typography';
import { ProposalStatusLabel } from './ProposalStatusLabel';
import { Link } from '~/design-system/Links';
import { ButtonLink } from '~/design-system/Buttons';
import type { SpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';
import { Avatar } from '~/design-system/Avatar';

type Props = {
  talkId: string;
  submissions: Array<{
    slug: string;
    name: string;
    bannerUrl: string | null;
    proposalStatus: SpeakerProposalStatus;
  }>;
};

export function ProposalSubmissionsSection({ talkId, submissions }: Props) {
  return (
    <Card as="section" p={8} className="space-y-6">
      <H3 mb={0}>Submissions</H3>
      {submissions.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {submissions.map((submission) => (
            <li key={submission.slug} className="flex items-center justify-between gap-2">
              <Link to={`/${submission.slug}/proposals`} className="flex gap-2">
                <Avatar photoURL={submission.bannerUrl} name={submission.name} square size="xs" aria-hidden />
                <Text size="s" variant="link" strong heading truncate>
                  {submission.name}
                </Text>
              </Link>
              <ProposalStatusLabel status={submission.proposalStatus} />
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
