import { ArchiveBoxIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';

import { Button } from '~/design-system/button.tsx';

type Props = { archived: boolean };

export function TalkArchiveButton({ archived }: Props) {
  const { t } = useTranslation();

  const action = archived ? 'restore-talk' : 'archive-talk';
  const label = archived ? t('common.restore') : t('common.archive');
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
