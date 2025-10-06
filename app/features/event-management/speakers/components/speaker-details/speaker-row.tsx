import { Avatar } from '~/design-system/avatar.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = {
  name: string;
  picture?: string | null;
  description?: string | null;
};

export function SpeakerRow({ name, picture, description }: Props) {
  return (
    <div className="flex items-center gap-2 truncate">
      <Avatar picture={picture} name={name} size="xs" />
      <div className="flex items-baseline gap-2 truncate">
        <Text weight="semibold" truncate className="group-hover:underline">
          {name}
        </Text>

        {description ? (
          <Text variant="secondary" size="xs" truncate>
            {description}
          </Text>
        ) : null}
      </div>
    </div>
  );
}
