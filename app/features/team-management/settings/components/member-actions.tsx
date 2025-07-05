import { UserPlusIcon } from '@heroicons/react/20/solid';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { TEAM_ROLES } from '~/shared/constants.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Modal } from '~/shared/design-system/dialogs/modals.tsx';
import { Radio, RadioGroup } from '~/shared/design-system/forms/radio-group.tsx';
import { Text } from '~/shared/design-system/typography.tsx';
import { InvitationModal } from '../../../../shared/design-system/dialogs/invitation-modal.tsx';

type RemoveButtonProps = { memberId: string; memberName: string | null };

export function RemoveButton({ memberId, memberName }: RemoveButtonProps) {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        aria-label={t('team.settings.members.remove-modal.button.label', { memberName })}
        variant="important"
        size="s"
        onClick={() => setModalOpen(true)}
      >
        {t('common.remove')}
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
  const { t } = useTranslation();
  const formId = useId();
  return (
    <Modal title={t('team.settings.members.remove-modal.heading', { memberName })} open={isOpen} onClose={onClose}>
      <Modal.Content>
        <Form id={formId} method="POST" onSubmit={onClose}>
          <Text>{t('team.settings.members.remove-modal.description')}</Text>
          <input type="hidden" name="memberId" value={memberId} />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} type="button" variant="secondary">
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value="remove-member" form={formId}>
          {t('common.remove-item', { item: memberName })}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

type ChangeRoleButtonProps = { memberId: string; memberName: string | null; memberRole: string };

export function ChangeRoleButton({ memberId, memberName, memberRole }: ChangeRoleButtonProps) {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        aria-label={t('team.settings.members.change-role-modal.button.label', { memberName })}
        variant="secondary"
        size="s"
        onClick={() => setModalOpen(true)}
      >
        {t('team.settings.members.change-role-modal.button')}
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

function ChangeRoleModal({ memberId, memberName, memberRole, isOpen, onClose }: ChangeRoleModalProps) {
  const { t } = useTranslation();
  const formId = useId();
  return (
    <Modal title={t('team.settings.members.change-role-modal.heading', { memberName })} open={isOpen} onClose={onClose}>
      <Modal.Content>
        <Form id={formId} method="POST" onSubmit={onClose}>
          <input type="hidden" name="memberId" value={memberId} />
          <RadioGroup>
            {TEAM_ROLES.map((role) => (
              <Radio
                key={role}
                name="memberRole"
                value={role}
                description={t(`common.member.role.description.${role}`)}
                defaultChecked={memberRole === role}
                required
              >
                {t(`common.member.role.label.${role}`)}
              </Radio>
            ))}
          </RadioGroup>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose} type="button" variant="secondary">
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value="change-role" form={formId}>
          {t('team.settings.members.change-role-modal.confirm.button', { memberName })}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

type InviteProps = { invitationLink: string | undefined };

export function InviteMemberButton({ invitationLink }: InviteProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (!invitationLink) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} iconLeft={UserPlusIcon}>
        {t('team.settings.members.invite-modal.button')}
      </Button>
      <InvitationModal
        open={open}
        invitationLink={invitationLink}
        onClose={() => setOpen(false)}
        title={t('team.settings.members.invite-modal.heading')}
        description={t('team.settings.members.invite-modal.description')}
      />
    </>
  );
}
