import { useFetcher } from '@remix-run/react';
import { EventForm } from '~/shared-components/events/EventForm';
import { Button } from '~/design-system/Buttons';
import { H1, Subtitle } from '~/design-system/Typography';

type Props = {
  type: string;
  slug: string;
  onCancel: () => void;
};

export function NewEventForm({ type, slug, onCancel }: Props) {
  const fetcher = useFetcher();
  const errors = fetcher.data;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <H1 size="base">Create a new event</H1>
        <Subtitle>You can make it public or private.</Subtitle>
      </div>

      <fetcher.Form action={`/team/${slug}`} method="POST" className="space-y-8">
        <EventForm errors={errors} />

        <div className="flex justify-end gap-4">
          <input name="type" type="hidden" value={type} />

          <Button type="button" variant="secondary" onClick={onCancel}>
            Go back
          </Button>
          <Button type="submit">Create event</Button>
        </div>
      </fetcher.Form>
    </div>
  );
}
