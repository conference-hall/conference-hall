import { Form } from '@remix-run/react';

import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';

type ScheduleEditProps = {
  name: string;
  errors?: Record<string, string | string[]> | null;
};

export function ScheduleEditForm({ name, errors }: ScheduleEditProps) {
  return (
    <Card as="section">
      <Card.Content>
        <Form id="edit-schedule-form" method="POST" className="space-y-4 lg:space-y-6">
          <Input name="name" label="Name" defaultValue={name} required error={errors?.name} />
        </Form>
      </Card.Content>
      <Card.Actions>
        <Button type="submit" name="intent" value="edit-schedule" form="edit-schedule-form">
          Save
        </Button>
      </Card.Actions>
    </Card>
  );
}
