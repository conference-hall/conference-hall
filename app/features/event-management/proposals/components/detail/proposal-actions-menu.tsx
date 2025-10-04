import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisVerticalIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { iconButton } from '~/design-system/icon-buttons.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { TalkEditDrawer } from '~/features/speaker/talk-library/components/talk-forms/talk-form-drawer.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';

type ProposalActionsMenuProps = {
  proposal: {
    title: string;
    abstract: string;
    references: string | null;
    languages: string[];
    level: string | null;
    formats?: Array<{ id: string }>;
    categories?: Array<{ id: string }>;
  };
  errors: SubmissionErrors;
  canEditEventProposal: boolean;
};

export function ProposalActionsMenu({ proposal, errors, canEditEventProposal }: ProposalActionsMenuProps) {
  const { t } = useTranslation();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const onOpenEdit = () => setEditDrawerOpen(true);
  const onCloseEdit = () => setEditDrawerOpen(false);

  if (!canEditEventProposal) return null;

  return (
    <>
      <Menu>
        <MenuButton
          className={iconButton({ variant: 'secondary' })}
          aria-label={t('event-management.proposal-page.actions-menu')}
        >
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </MenuButton>

        <MenuTransition>
          <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
            <MenuItem as="button" onClick={onOpenEdit} className={menuItem()}>
              <PencilSquareIcon className={menuItemIcon()} aria-hidden="true" />
              {t('common.edit')}
            </MenuItem>
          </MenuItems>
        </MenuTransition>
      </Menu>

      <TalkEditDrawer initialValues={proposal} errors={errors} open={editDrawerOpen} onClose={onCloseEdit} />
    </>
  );
}
