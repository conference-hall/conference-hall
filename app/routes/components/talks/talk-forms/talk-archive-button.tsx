import { ArchiveBoxIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';

type Props = { archived: boolean };

export function TalkArchiveButton({ archived }: Props) {
  const action = archived ? 'restore-talk' : 'archive-talk';
  const label = archived ? 'Restore' : 'Archive';
  const icon = archived ? ArchiveBoxXMarkIcon : ArchiveBoxIcon;

  return (
    <Form method="POST">
      <input type="hidden" name="intent" value={action} />
      <Button type="submit" iconLeft={icon} aria-label={label} variant="secondary">
        {label}
      </Button>
    </Form>
  );
}
