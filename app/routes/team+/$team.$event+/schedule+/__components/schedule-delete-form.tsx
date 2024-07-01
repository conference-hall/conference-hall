import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSubmit } from '@remix-run/react';

import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';

export function ScheduleDeleteForm() {
  const submit = useSubmit();

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this schedule? This action cannot be undone.')) return;
    submit({ intent: 'delete-schedule' }, { method: 'POST' });
  };

  return (
    <Card as="section">
      <Card.Title>
        <H2>Delete schedule</H2>
      </Card.Title>

      <Card.Content>
        <Callout title="Warning" icon={ExclamationTriangleIcon}>
          This action is irreversible and will permanently delete the schedule.
        </Callout>
      </Card.Content>

      <Card.Actions>
        <Button onClick={handleDelete}>Delete schedule</Button>
      </Card.Actions>
    </Card>
  );
}
