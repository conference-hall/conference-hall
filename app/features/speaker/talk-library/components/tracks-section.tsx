import { FolderIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Card } from '~/design-system/layouts/card.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';

type Track = { id: string; name: string; description?: string | null };

type Props = {
  formats: Array<Track>;
  categories: Array<Track>;
  hasFormats: boolean;
  hasCategories: boolean;
};

export function TracksSection({ formats, categories, hasFormats, hasCategories }: Props) {
  const { t } = useTranslation();

  if (!hasFormats && !hasCategories) return null;

  return (
    <Card as="section">
      <Card.Content>
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {hasFormats ? (
            <TracksBlock
              icon={RectangleStackIcon}
              label={t('talk.formats', { count: formats.length })}
              emptyLabel={t('talk.formats.empty')}
              tracks={formats}
            />
          ) : null}

          {hasCategories ? (
            <TracksBlock
              icon={FolderIcon}
              label={t('talk.categories', { count: categories.length })}
              emptyLabel={t('talk.categories.empty')}
              tracks={categories}
            />
          ) : null}
        </dl>
      </Card.Content>
    </Card>
  );
}

type TracksBlockProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  emptyLabel: string;
  tracks: Array<Track>;
};

function TracksBlock({ icon: Icon, label, emptyLabel, tracks }: TracksBlockProps) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-sm leading-6 font-medium text-gray-900">
        <Icon className="size-4 shrink-0 text-gray-400" aria-hidden="true" />
        {label}
      </dt>

      <dd className="mt-5 flex flex-col gap-5">
        {tracks.length === 0 ? (
          <Subtitle>{emptyLabel}</Subtitle>
        ) : (
          tracks.map(({ id, name, description }) => (
            <div key={id}>
              <Text size="s" weight="medium">
                {name}
              </Text>
              {description ? <Subtitle>{description}</Subtitle> : null}
            </div>
          ))
        )}
      </dd>
    </div>
  );
}
