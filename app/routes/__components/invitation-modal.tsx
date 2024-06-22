import { CopyInput } from '~/design-system/forms/copy-input.tsx';
import { Modal } from '~/design-system/modals.tsx';
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
    <Modal open={open} onClose={onClose}>
      <Modal.Title>{title}</Modal.Title>
      <Modal.Content className="space-y-6">
        <Text>{description}</Text>
        <CopyInput aria-label="Copy invitation link" value={invitationLink} disabled />
      </Modal.Content>
    </Modal>
  );
}
