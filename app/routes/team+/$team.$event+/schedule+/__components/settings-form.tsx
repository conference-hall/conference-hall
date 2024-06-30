import { Form } from '@remix-run/react';

import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

import { generateTimes } from './schedule/utils/timeslots.ts';

const TIME_OPTIONS = generateTimes('00:00', '23:00', 60).map((t) => ({ id: t, name: t }));
const INTERVAL_OPTIONS = [
  { id: '5', name: '5 min' },
  { id: '10', name: '10 min' },
  { id: '15', name: '15 min' },
];

type SettingsFormProps = {
  settings: { name: string; startTimeslot: string; endTimeslot: string; intervalMinutes: number };
  errors?: Record<string, string | string[]> | null;
};

export function SettingsForm({ settings, errors }: SettingsFormProps) {
  return (
    <Card as="section">
      <Card.Title>
        <H2>Schedule display</H2>
        <Subtitle>Customize how the schedule looks like.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form id="save-settings" method="POST" className="space-y-4 lg:space-y-6">
          <Input name="name" label="Name" defaultValue={settings.name} required error={errors?.name} />
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <Select
              name="startTimeslot"
              label="Timeline start"
              defaultValue={settings.startTimeslot}
              options={TIME_OPTIONS}
              className="col-span-3 sm:col-span-1"
            />
            <Select
              name="endTimeslot"
              label="Timeline end"
              defaultValue={settings.endTimeslot}
              options={TIME_OPTIONS}
              className="col-span-3 sm:col-span-1"
            />
            <Select
              name="intervalMinutes"
              label="Time slot interval (minutes)"
              defaultValue={String(settings.intervalMinutes)}
              options={INTERVAL_OPTIONS}
              className="col-span-3 sm:col-span-1"
            />
          </div>
        </Form>
      </Card.Content>
      <Card.Actions>
        <ButtonLink to=".." relative="path" variant="secondary">
          Go back
        </ButtonLink>
        <Button type="submit" name="intent" value="save-settings" form="save-settings">
          Save
        </Button>
      </Card.Actions>
    </Card>
  );
}
