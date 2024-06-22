import { AvatarGroup } from '~/design-system/avatar.cap.tsx';
import { CardLink } from '~/design-system/layouts/card.cap.tsx';
import { Text } from '~/design-system/typography.cap.tsx';
import type { SpeakerProposalStatus } from '~/types/speaker.types.ts';

import { ProposalStatusLabel } from './proposal-status-label.tsx';

type Props = {
  id: string;
  title: string;
  status?: SpeakerProposalStatus;
  speakers: Array<{ picture?: string | null; name?: string | null }>;
};

export function ProposalCard({ id, title, speakers, status }: Props) {
  return (
    <CardLink as="li" to={id} className="flex flex-col px-4 py-4 sm:px-6">
      <Text size="base" mb={2} weight="medium" truncate>
        {title}
      </Text>
      <div className="flex items-center justify-between">
        <AvatarGroup avatars={speakers} displayNames />
        {status && <ProposalStatusLabel status={status} />}
      </div>
    </CardLink>
  );
}
