import { AvatarGroup } from '~/design-system/Avatar.tsx';
import { CardLink } from '~/design-system/layouts/Card.tsx';
import { Text } from '~/design-system/Typography.tsx';
import type { SpeakerProposalStatus } from '~/routes/__server/proposals/get-speaker-proposal-status.ts';

import { ProposalStatusLabel } from './ProposalStatusLabel.tsx';

type Props = {
  id: string;
  title: string;
  status?: SpeakerProposalStatus;
  speakers: Array<{ picture?: string | null; name?: string | null }>;
};

export function ProposalCard({ id, title, speakers, status }: Props) {
  return (
    <CardLink as="li" to={id} className="flex flex-col px-4 py-4 sm:px-6">
      <Text size="base" mb={2} heading strong truncate>
        {title}
      </Text>
      <div className="flex items-center justify-between">
        <AvatarGroup avatars={speakers} displayNames />
        {status && <ProposalStatusLabel status={status} />}
      </div>
    </CardLink>
  );
}
