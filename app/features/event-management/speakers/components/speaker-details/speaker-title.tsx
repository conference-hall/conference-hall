import { Avatar } from '~/design-system/avatar.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  name: string;
  picture?: string | null;
  company?: string | null;
};

export function SpeakerTitle({ name, picture, company }: Props) {
  return (
    <div className="flex items-center gap-4">
      <Avatar picture={picture} name={name} size="l" />

      <div className="overflow-hidden">
        <Text weight="semibold" size="base" truncate>
          {name}
        </Text>
        <Text variant="secondary" weight="normal" truncate>
          {company}
        </Text>
      </div>
    </div>
  );
}
