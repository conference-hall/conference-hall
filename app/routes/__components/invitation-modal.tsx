import { Modal } from '~/design-system/dialogs/modals.tsx';
import { CopyInput } from '~/design-system/forms/copy-input.tsx';
import { Text } from '~/design-system/typography.tsx';

type InvitationModalProps = {
  title: string;
  description: string;
  invitationLink: string;
  open: boolean;
  onClose: () => void;
};

export function InvitationModal({ title, description, invitationLink, open, onClose }: InvitationModalProps) {
  return (
    <Modal title={title} open={open} onClose={onClose}>
      <Modal.Content className="space-y-6">
        <Text>{description}</Text>
        <CopyInput aria-label="Copy invitation link" value={invitationLink} disabled />
      </Modal.Content>
    </Modal>
  );
}
