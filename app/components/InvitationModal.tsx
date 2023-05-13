import { UserPlusIcon } from '@heroicons/react/24/outline';

import { Modal } from '~/design-system/dialogs/Modals';
import { CopyInput } from '~/design-system/forms/CopyInput';

type InvitationModalProps = {
  title: string;
  description: string;
  invitationLink: string;
  open: boolean;
  onClose: () => void;
};

export function InvitationModal({ title, description, invitationLink, open, onClose }: InvitationModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Title icon={UserPlusIcon} title={title} description={description} />
      <CopyInput aria-label="Copy invitation link" value={invitationLink} disabled className="mt-8" />
    </Modal>
  );
}
