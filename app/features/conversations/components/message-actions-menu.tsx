import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';

type Props = {
  message: Message;
  intentSuffix: string;
  onEdit: VoidFunction;
  className?: string;
};

export function MessageActionsMenu({ message, intentSuffix, onEdit, className }: Props) {
  const { t } = useTranslation();

  return (
    <Menu>
      <MenuButton aria-label={t('event-management.proposal-page.actions-menu')} className={className}>
        <EllipsisHorizontalIcon className="h-4 w-4" aria-hidden="true" />
      </MenuButton>

      <MenuTransition>
        <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
          <MenuItem as="button" onClick={onEdit} className={menuItem()}>
            <PencilSquareIcon className={menuItemIcon()} aria-hidden="true" />
            {t('common.edit')}
          </MenuItem>

          {/* todo(conversation): add a confirmation alert */}
          {/* todo(conversation): how to do optimistic rendering */}
          {/* todo(conversation): how to have generic intents */}
          <MenuItem as={Form} method="POST" className={menuItem({ variant: 'important' })}>
            <input type="hidden" name="id" value={message.id} />
            <button
              type="submit"
              name="intent"
              value={`delete-${intentSuffix}`}
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
