import { AvatarGroup } from '~/design-system/Avatar';
import { CardLink } from '~/design-system/Card';
import { Text } from '~/design-system/Typography';
import { ProposalStatusLabel } from '~/shared-components/ProposalStatusLabel';

type Props = {
  id: string;
  title: string;
  speakers: Array<{ photoURL?: string | null; name?: string | null }>;
  isDraft?: boolean;
  isSubmitted?: boolean;
  isAccepted?: boolean;
  isRejected?: boolean;
  isConfirmed?: boolean;
  isDeclined?: boolean;
  isArchived?: boolean;
  isCfpOpen?: boolean;
};

export function TalkCard(props: Props) {
  const { id, title, speakers, ...statuses } = props;

  return (
    <CardLink as="li" rounded="lg" to={id}>
      <div className="flex flex-col px-4 py-4 sm:px-6">
        <Text size="l" mb={2} strong heading truncate>
          {title}
        </Text>
        <div className="flex items-center justify-between">
          <AvatarGroup avatars={speakers} displayNames />
          <ProposalStatusLabel {...statuses} />
        </div>
      </div>
    </CardLink>
  );
}
