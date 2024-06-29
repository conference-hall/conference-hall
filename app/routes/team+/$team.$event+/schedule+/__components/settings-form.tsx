import { Form } from '@remix-run/react';

import { Button, ButtonLink } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';

import type { Track } from './schedule/types.ts';
import { generateTimes } from './schedule/utils/timeslots.ts';

export type ScheduleSettings = {
  name: string;
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  tracks: Array<Track>;
};

const TIME_OPTIONS = generateTimes('00:00', '23:00', 60).map((t) => ({ id: t, name: t }));
const INTERVAL_OPTIONS = [
  { id: '5', name: '5 min' },
  { id: '10', name: '10 min' },
  { id: '15', name: '15 min' },
];

type SettingsFormProps = {
  initialValues: ScheduleSettings;
};

export function SettingsForm({ initialValues }: SettingsFormProps) {
  return (
    <Card as="section">
      <Card.Title>
        <H2>Schedule settings</H2>
        <Subtitle>Configure your conference schedule timeline.</Subtitle>
      </Card.Title>

      <Card.Content>
        <Form id="general-form" method="POST" className="space-y-4 lg:space-y-6">
          <Input name="name" label="Name" defaultValue={initialValues.name} required />
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <Select
              name="startTime"
              label="Timeline start"
              defaultValue={initialValues.startTime}
              options={TIME_OPTIONS}
              className="col-span-3 sm:col-span-1"
            />
            <Select
              name="endTime"
              label="Timeline end"
              defaultValue={initialValues.endTime}
              options={TIME_OPTIONS}
              className="col-span-3 sm:col-span-1"
            />
            <Select
              name="intervalMinutes"
              label="Time slot interval (minutes)"
              defaultValue={String(initialValues.intervalMinutes)}
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
        <Button type="submit" name="intent" value="general" form="save-settings">
          Save
        </Button>
      </Card.Actions>
    </Card>
  );
}
