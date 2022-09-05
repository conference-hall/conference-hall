import { ShieldExclamationIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';
import { useMemo, useState } from 'react';
import { Button } from '~/design-system/Buttons';
import { Modal } from '~/design-system/dialogs/Modals';
import { Radio, RadioGroup } from '~/design-system/forms/RadioGroup';

type RemoveButtonProps = { memberId: string; memberName: string | null };

export function RemoveButton({ memberId, memberName }: RemoveButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        aria-label={`Remove ${memberName} from organization`}
        variant="secondary"
        size="small"
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
      <Form method="post" onSubmit={onClose}>
        <Modal.Title
          title={`Remove ${memberName} from the organization?`}
          description="The member will be removed from the organization and won't be able to access it anymore."
          icon={UserMinusIcon}
          iconColor="danger"
        />
        <input type="hidden" name="_action" value="remove-member" />
        <input type="hidden" name="_memberId" value={memberId} />
        <Modal.Actions>
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
        size="small"
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
  { label: 'Owner', value: 'OWNER', description: 'Has full administrative access to the entire organization.' },
  { label: 'Member', value: 'MEMBER', description: 'Can see every in the organization, and can create new events.' },
  { label: 'Reviewer', value: 'REVIEWER', description: 'Can only review events proposals in the organization.' },
];

function ChangeRoleModal({ memberId, memberName, memberRole, isOpen, onClose }: ChangeRoleModalProps) {
  const roles = useMemo(() => ALL_ROLES.filter((role) => role.value !== memberRole), [memberRole]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Form method="post" onSubmit={onClose}>
        <Modal.Title title={`Change the role of ${memberName}?`} icon={ShieldExclamationIcon} />
        <RadioGroup className="mt-4 sm:mt-8">
          {roles.map((role) => (
            <Radio
              key={role.value}
              id={role.value}
              name="memberRole"
              value={role.value}
              description={role.description}
              required
            >
              {role.label}
            </Radio>
          ))}
        </RadioGroup>
        <input type="hidden" name="_action" value="change-role" />
        <input type="hidden" name="_memberId" value={memberId} />
        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Change {memberName}'s role</Button>
        </Modal.Actions>
      </Form>
    </Modal>
  );
}
