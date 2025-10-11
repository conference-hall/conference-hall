import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisHorizontalIcon, PencilSquareIcon, ShareIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { iconButton } from '~/design-system/icon-buttons.tsx';
import { menuItem, menuItemIcon, menuItems } from '~/design-system/styles/menu.styles.ts';
import { MenuTransition } from '~/design-system/transitions.tsx';
import { TalkEditDrawer } from '~/features/speaker/talk-library/components/talk-forms/talk-form-drawer.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
import { ShareProposalModal } from './share-proposal-modal.tsx';

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
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const onOpenEdit = () => setEditDrawerOpen(true);
  const onCloseEdit = () => setEditDrawerOpen(false);
  const onOpenShare = () => setShareModalOpen(true);
  const onCloseShare = () => setShareModalOpen(false);

  return (
    <>
      <Menu>
        <MenuButton
          aria-label={t('event-management.proposal-page.actions-menu')}
          className={iconButton({ variant: 'secondary' })}
        >
          <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
        </MenuButton>

        <MenuTransition>
          <MenuItems anchor={{ to: 'bottom end', gap: '8px' }} className={menuItems()}>
            {canEditEventProposal && (
              <MenuItem as="button" onClick={onOpenEdit} className={menuItem()}>
                <PencilSquareIcon className={menuItemIcon()} aria-hidden="true" />
                {t('common.edit')}
              </MenuItem>
            )}

            <MenuItem as="button" onClick={onOpenShare} className={menuItem()}>
              <ShareIcon className={menuItemIcon()} aria-hidden="true" />
              {t('event-management.proposal-page.share-link')}
            </MenuItem>
          </MenuItems>
        </MenuTransition>
      </Menu>

      <ShareProposalModal open={shareModalOpen} onClose={onCloseShare} />

      {canEditEventProposal && (
        <TalkEditDrawer initialValues={proposal} errors={errors} open={editDrawerOpen} onClose={onCloseEdit} />
      )}
    </>
  );
}
