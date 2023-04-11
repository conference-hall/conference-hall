import { AvatarGroup } from '~/design-system/Avatar';
import { CardLink } from '~/design-system/Card';
import { Text } from '~/design-system/Typography';
import type { SpeakerProposalStatus } from '~/shared-server/proposals/get-speaker-proposal-status';
import { ProposalStatusLabel } from './ProposalStatusLabel';

type Props = {
  id: string;
  title: string;
  status?: SpeakerProposalStatus;
  speakers: Array<{ photoURL?: string | null; name?: string | null }>;
};

export function ProposalCard({ id, title, speakers, status }: Props) {
  return (
    <CardLink as="li" to={id}>
      <div className="flex flex-col px-4 py-4 sm:px-6">
        <Text size="l" mb={2} strong heading truncate>
          {title}
        </Text>
        <div className="flex items-center justify-between">
          <AvatarGroup avatars={speakers} displayNames />
          {status && <ProposalStatusLabel status={status} />}
        </div>
      </div>
    </CardLink>
  );
}
