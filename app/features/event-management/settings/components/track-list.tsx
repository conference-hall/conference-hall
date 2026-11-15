import { useTranslation } from 'react-i18next';
import { useFetcher, useSubmit } from 'react-router';
import { Badge } from '~/design-system/badges.tsx';
import { Button } from '~/design-system/button.tsx';
import { List } from '~/design-system/list/list.tsx';
import { SortableList } from '~/design-system/list/sortable-list.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import { formatDuration } from '~/shared/datetimes/datetimes.ts';
import { EditTrackButton, NewTrackButton } from './save-track-form.tsx';

type TrackListProps = {
  type: 'formats' | 'categories';
  tracks: Array<{
    id: string;
    name: string;
    description: string | null;
    durationInMinutes?: number | null;
    color: string;
  }>;
};

export function TrackList({ type, tracks }: TrackListProps) {
  const { t, i18n } = useTranslation();
  const submit = useSubmit();
  const deleteFetcher = useFetcher({ key: `delete-${type}` });

  const handleReorder = (id: string, targetIndex: number) => {
    submit({ intent: `reorder-${type}`, id, targetIndex }, { method: 'POST', navigate: false });
  };

  return (
    <List>
      <List.Header className="flex justify-between">
        <Text weight="medium">
          {tracks.length} {type}
        </Text>
        <NewTrackButton type={type} />
      </List.Header>

      <SortableList
        items={tracks}
        getLabel={(track) => track.name}
        onReorder={handleReorder}
        aria-label={`${type} list`}
      >
        {(track) => (
          <div className="flex items-center justify-between">
            <div className="min-w-0 truncate">
              <Text weight="medium" truncate>
                <Badge hexColor={track.color} pill>
                  <span className="truncate">{track.name}</span>
                </Badge>
              </Text>
              <Subtitle size="xs" className="mt-1" truncate>
                {track.durationInMinutes ? (
                  <span className="mx-1 font-normal text-gray-500">
                    {formatDuration(track.durationInMinutes, i18n.language)} –
                  </span>
                ) : null}
                {track.description}
              </Subtitle>
            </div>
            <div className="ml-4 flex shrink-0 gap-2">
              <EditTrackButton type={type} initialValues={track} />
              <deleteFetcher.Form method="POST">
                <input type="hidden" name="trackId" value={track.id} />
                <Button type="submit" name="intent" value={`delete-${type}`} variant="important" size="sm">
                  {t('common.delete')}
                </Button>
              </deleteFetcher.Form>
            </div>
          </div>
        )}
      </SortableList>
    </List>
  );
}
