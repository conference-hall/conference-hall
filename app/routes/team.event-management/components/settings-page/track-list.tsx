import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/shared/design-system/buttons.tsx';
import { List } from '~/shared/design-system/list/list.tsx';
import { Subtitle, Text } from '~/shared/design-system/typography.tsx';
import { EditTrackButton, NewTrackButton } from './save-track-form.tsx';

type TrackListProps = {
  type: 'formats' | 'categories';
  tracks: Array<{ id: string; name: string; description: string | null }>;
};

export function TrackList({ type, tracks }: TrackListProps) {
  const { t } = useTranslation();
  return (
    <List>
      <List.Header className="flex justify-between">
        <Text weight="medium">
          {tracks.length} {type}
        </Text>
        <NewTrackButton type={type} />
      </List.Header>

      <List.Content aria-label={`${type} list`}>
        {tracks.map((track) => (
          <List.Row key={track.id} className="flex items-center justify-between p-4">
            <div className="truncate">
              <Text weight="medium" truncate>
                {track.name}
              </Text>
              <Subtitle truncate>{track.description}</Subtitle>
            </div>
            <div className="ml-4 flex shrink-0 gap-2">
              <EditTrackButton type={type} initialValues={track} />
              <Form method="POST">
                <input type="hidden" name="trackId" value={track.id} />
                <Button type="submit" name="intent" value={`delete-${type}`} variant="important" size="s">
                  {t('common.delete')}
                </Button>
              </Form>
            </div>
          </List.Row>
        ))}
      </List.Content>
    </List>
  );
}
