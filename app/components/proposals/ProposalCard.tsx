import { AvatarGroup } from '~/design-system/Avatar';
import { CardLink } from '~/design-system/layouts/Card';
import { Text } from '~/design-system/Typography';
import type { SpeakerProposalStatus } from '~/server/proposals/get-speaker-proposal-status';

import { ProposalStatusLabel } from './ProposalStatusLabel';

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
