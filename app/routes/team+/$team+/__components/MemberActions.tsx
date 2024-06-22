import { UserPlusIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import { useState } from 'react';

import { Button } from '~/design-system/Buttons.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/RadioGroup.tsx';
import { Modal } from '~/design-system/Modals.tsx';
import { Text } from '~/design-system/Typography.tsx';

import { InvitationModal } from '../../../__components/invitation-modal.tsx';

type RemoveButtonProps = { memberId: string; memberName: string | null };

export function RemoveButton({ memberId, memberName }: RemoveButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        aria-label={`Remove ${memberName} from team`}
        variant="secondary"
        size="s"
        onClick={() => setModalOpen(true)}
      >
        Remove
      </Button>
      <RemoveRoleModal
        memberId={memberId}
        memberName={memberName}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

type RemoveModalProps = {
  memberId: string;
  memberName: string | null;
  isOpen: boolean;
  onClose: () => void;
};

function RemoveRoleModal({ memberId, memberName, isOpen, onClose }: RemoveModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="POST" onSubmit={onClose}>
        <Modal.Title>{`Remove ${memberName} from the team?`}</Modal.Title>
        <Modal.Content>
          <Text>The member will be removed from the team and won't be able to access it anymore.</Text>
        </Modal.Content>
        <Modal.Actions>
          <input type="hidden" name="_action" value="remove-member" />
          <input type="hidden" name="_memberId" value={memberId} />
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Remove {memberName}</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}

type ChangeRoleButtonProps = { memberId: string; memberName: string | null; memberRole: string };

export function ChangeRoleButton({ memberId, memberName, memberRole }: ChangeRoleButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        aria-label={`Change role of ${memberName}`}
        variant="secondary"
        size="s"
        onClick={() => setModalOpen(true)}
      >
        Change role
      </Button>
      <ChangeRoleModal
        memberId={memberId}
        memberName={memberName}
        memberRole={memberRole}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

type ChangeRoleModalProps = {
  memberId: string;
  memberName: string | null;
  memberRole: string;
  isOpen: boolean;
  onClose: () => void;
};

const ALL_ROLES = [
  { label: 'Owner', value: 'OWNER', description: 'Has full administrative access to the entire team.' },
  { label: 'Member', value: 'MEMBER', description: 'Can see every in the team, and can create new events.' },
  { label: 'Reviewer', value: 'REVIEWER', description: 'Can only review events proposals in the team.' },
];

function ChangeRoleModal({ memberId, memberName, memberRole, isOpen, onClose }: ChangeRoleModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="POST" onSubmit={onClose}>
        <Modal.Title>{`Change the role of ${memberName}?`}</Modal.Title>
        <Modal.Content>
          <RadioGroup>
            {ALL_ROLES.map((role) => (
              <Radio
                key={role.value}
                id={role.value}
                name="memberRole"
                value={role.value}
                description={role.description}
                defaultChecked={memberRole === role.value}
                required
              >
                {role.label}
              </Radio>
            ))}
          </RadioGroup>
        </Modal.Content>
        <Modal.Actions>
          <input type="hidden" name="_action" value="change-role" />
          <input type="hidden" name="_memberId" value={memberId} />
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Change {memberName}'s role</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}

type InviteProps = { invitationLink: string };

export function InviteMemberButton({ invitationLink }: InviteProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} iconLeft={UserPlusIcon} variant="secondary">
        Invite member
      </Button>
      <InvitationModal
        open={open}
        invitationLink={invitationLink}
        onClose={() => setOpen(false)}
        title="Invite a member"
        description="You can invite a member to join your team by sharing an invitation link. Copy it and send it by email.
            The member will be automatically added once the invitation has been accepted."
      />
    </>
  );
}
