import { ArchiveBoxIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';

import { Button } from '~/design-system/Buttons.tsx';

type Props = { archived: boolean };

export function ArchiveOrRestoreTalkButton({ archived }: Props) {
  const action = archived ? 'restore-talk' : 'archive-talk';
  const label = archived ? 'Restore' : 'Archive';
  const icon = archived ? ArchiveBoxXMarkIcon : ArchiveBoxIcon;

  return (
    <Form method="POST">
      <input type="hidden" name="_action" value={action} />
      <Button type="submit" iconLeft={icon} aria-label={label} variant="secondary">
        {label}
      </Button>
    </Form>
  );
}
