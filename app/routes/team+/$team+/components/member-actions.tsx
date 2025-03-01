import { UserPlusIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/radio-group.tsx';
import { Text } from '~/design-system/typography.tsx';

import { InvitationModal } from '../../../components/modals/invitation-modal.tsx';

type RemoveButtonProps = { memberId: string; memberName: string | null };

export function RemoveButton({ memberId, memberName }: RemoveButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        aria-label={`Remove ${memberName} from team`}
        variant="important"
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
  onClose: VoidFunction;
};

function RemoveRoleModal({ memberId, memberName, isOpen, onClose }: RemoveModalProps) {
  return (
    <Modal title={`Remove ${memberName} from the team?`} open={isOpen} onClose={onClose}>
      <Modal.Content>
        <Form id="remove-member-form" method="POST" onSubmit={onClose}>
          <Text>The member will be removed from the team and won't be able to access it anymore.</Text>
          <input type="hidden" name="memberId" value={memberId} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" name="intent" value="remove-member" form="remove-member-form">
          Remove {memberName}
        </Button>
      </Modal.Actions>
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
  onClose: VoidFunction;
};

const ALL_ROLES = [
  {
    label: 'Owner',
    value: 'OWNER',
    description:
      'Full control over team and events, including member management, event creation, and proposal publishing.',
  },
  {
    label: 'Member',
    value: 'MEMBER',
    description:
      'Can view team, access and edit events, deliberate on proposals, and publish results. Cannot create events or manage team settings.',
  },
  {
    label: 'Reviewer',
    value: 'REVIEWER',
    description: 'Read-only access to team and events, with no editing or publishing rights.',
  },
];

function ChangeRoleModal({ memberId, memberName, memberRole, isOpen, onClose }: ChangeRoleModalProps) {
  return (
    <Modal title={`Change the role of ${memberName}?`} open={isOpen} onClose={onClose}>
      <Modal.Content>
        <Form id="change-role-form" method="POST" onSubmit={onClose}>
          <input type="hidden" name="memberId" value={memberId} />
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
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit" name="intent" value="change-role" form="change-role-form">
          Change {memberName}'s role
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

type InviteProps = { invitationLink: string | undefined };

export function InviteMemberButton({ invitationLink }: InviteProps) {
  const [open, setOpen] = useState(false);

  if (!invitationLink) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} iconLeft={UserPlusIcon}>
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
