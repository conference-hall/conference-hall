import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { EditTrackButton, NewTrackButton } from './save-track-form.tsx';

type TrackListProps = {
  type: 'formats' | 'categories';
  tracks: Array<{ id: string; name: string; description: string | null }>;
};

export function TrackList({ type, tracks }: TrackListProps) {
  const { t } = useTranslation();
  const fetcher = useFetcher({ key: `reorder-${type}` });

  const handleReorder = (trackId: string, direction: 'up' | 'down') => {
    fetcher.submit({ intent: `reorder-${type}`, trackId, direction }, { method: 'POST' });
  };

  return (
    <List>
      <List.Header className="flex justify-between">
        <Text weight="medium">
          {tracks.length} {type}
        </Text>
        <NewTrackButton type={type} />
      </List.Header>

      <List.Content aria-label={`${type} list`}>
        {tracks.map((track, index) => (
          <List.Row key={track.id} className="flex items-center justify-between p-4">
            <div className="truncate">
              <Text weight="medium" truncate>
                {track.name}
              </Text>
              <Subtitle truncate>{track.description}</Subtitle>
            </div>
            <div className="ml-4 flex shrink-0 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={ArrowUpIcon}
                aria-label={t('event-management.settings.tracks.reorder.up')}
                disabled={index === 0}
                onClick={() => handleReorder(track.id, 'up')}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={ArrowDownIcon}
                aria-label={t('event-management.settings.tracks.reorder.down')}
                disabled={index === tracks.length - 1}
                onClick={() => handleReorder(track.id, 'down')}
              />
              <EditTrackButton type={type} initialValues={track} />
              <fetcher.Form method="POST">
                <input type="hidden" name="trackId" value={track.id} />
                <Button type="submit" name="intent" value={`delete-${type}`} variant="important" size="sm">
                  {t('common.delete')}
                </Button>
              </fetcher.Form>
            </div>
          </List.Row>
        ))}
      </List.Content>
    </List>
  );
}
