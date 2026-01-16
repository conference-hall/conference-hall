import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { useFetcher } from 'react-router';
import type { Message } from '~/shared/types/conversation.types.ts';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { Button } from '~/design-system/button.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';

type Props = {
  message: Message;
  intentSuffix: string;
  onEdit: VoidFunction;
  onDelete?: (id: string) => void;
  canManageConversations: boolean;
};

export function MessageActionsMenu({ message, intentSuffix, onEdit, onDelete, canManageConversations }: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();
  const intent = `delete-${intentSuffix}`;

  const deleteFetcher = useFetcher({ key: `${intent}:${message.id}` });

  const handleDelete = async () => {
    if (!confirm(t('common.confirmation.delete'))) return;
    onDelete?.(message.id);
    await deleteFetcher.submit(
      { intent, id: message.id },
      { method: 'POST', preventScrollReset: true, flushSync: true },
    );
  };

  const deleteDisabled = deleteFetcher.state === 'submitting';

  if (message.sender.userId !== currentUser?.id && !canManageConversations) {
    return null;
  }

  return (
    <Menu>
      <MenuButton
        as={Button}
        label={t('common.conversation.actions-menu')}
        icon={EllipsisHorizontalIcon}
        variant="tertiary"
        size="xs"
      />

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()} modal={false}>
          <MenuItem as="button" onClick={onEdit} className={menuItem()}>
            <PencilSquareIcon className={menuItemIcon()} aria-hidden="true" />
            {t('common.edit')}
          </MenuItem>

          <MenuItem
            as="button"
            onClick={handleDelete}
            className={menuItem({ variant: 'important' })}
            disabled={deleteDisabled}
          >
            <TrashIcon className={menuItemIcon({ variant: 'important' })} aria-hidden="true" />
            {t('common.delete')}
          </MenuItem>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
