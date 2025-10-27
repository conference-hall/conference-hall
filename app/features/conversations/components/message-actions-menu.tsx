import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { ButtonIcon } from '~/design-system/button-icon.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = {
  message: Message;
  intentSuffix: string;
  onEdit: VoidFunction;
  canManageConversations: boolean;
};

export function MessageActionsMenu({ message, intentSuffix, onEdit, canManageConversations }: Props) {
  const { t } = useTranslation();
  const currentUser = useUser();
  const intent = `delete-${intentSuffix}`;

  if (message.sender.userId !== currentUser?.id && !canManageConversations) {
    return null;
  }

  return (
    <Menu>
      <MenuButton
        as={ButtonIcon}
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
            as={Form}
            method="POST"
            className={menuItem({ variant: 'important' })}
            navigate={false}
            preventScrollReset={true}
            fetcherKey={`${intent}:${message.id}`}
            onSubmit={(event) => {
              if (!confirm(t('common.confirmation.delete'))) return event.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={message.id} />
            <button
              type="submit"
              name="intent"
              value={intent}
              className="flex items-center gap-2 w-full cursor-pointer"
            >
              <TrashIcon className={menuItemIcon({ variant: 'important' })} aria-hidden="true" />
              {t('common.delete')}
            </button>
          </MenuItem>
        </MenuItems>
      </MenuTransition>
    </Menu>
  );
}
