import { LinkIcon, NoSymbolIcon } from '@heroicons/react/20/solid';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import type { InviteType } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { Modal } from '~/design-system/dialogs/Modals';
import { CopyInput } from '~/design-system/forms/CopyInput';

type InvitationModalProps = {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  invitationLink?: string;
  type: InviteType;
  id: string;
};

export function InvitationModal({ title, description, open, onClose, invitationLink, type, id }: InvitationModalProps) {
  const invite = useFetcher();

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Title icon={UserPlusIcon} title={title} description={description} />
      {invitationLink && (
        <CopyInput aria-label="Copy invitation link" value={invitationLink} disabled className="mt-8" />
      )}
      <Modal.Actions>
        {invitationLink ? (
          <invite.Form method="POST" action="/invitation/revoke">
            <input type="hidden" name="_type" value={type} />
            <input type="hidden" name="_id" value={id} />
            <Button type="submit" variant="secondary" iconLeft={NoSymbolIcon}>
              Revoke invitation link
            </Button>
          </invite.Form>
        ) : (
          <invite.Form method="POST" action="/invitation/generate">
            <input type="hidden" name="_type" value={type} />
            <input type="hidden" name="_id" value={id} />
            <Button type="submit" iconLeft={LinkIcon}>
              Generate invitation link
            </Button>
          </invite.Form>
        )}
      </Modal.Actions>
    </Modal>
  );
}
