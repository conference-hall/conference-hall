import { CopyInput } from '~/design-system/forms/CopyInput.tsx';
import { Modal } from '~/design-system/Modals.tsx';

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
      <Modal.Title title={title} description={description} />
      <CopyInput aria-label="Copy invitation link" value={invitationLink} disabled className="mt-8" />
    </Modal>
  );
}
