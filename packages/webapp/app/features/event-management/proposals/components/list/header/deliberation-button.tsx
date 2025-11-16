import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useId, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Text } from '~/design-system/typography.tsx';

const statuses = {
  ACCEPTED: { i18nKey: 'common.proposals.status.accepted', icon: CheckIcon, color: 'text-green-600' },
  PENDING: { i18nKey: 'common.proposals.status.pending', icon: QuestionMarkCircleIcon, color: 'text-gray-600' },
  REJECTED: { i18nKey: 'common.proposals.status.rejected', icon: XMarkIcon, color: 'text-red-600' },
} as const;

type Props = {
  status: keyof typeof statuses;
  selection: string[];
  isAllPagesSelected: boolean;
  totalSelected: number;
};

export function DeliberationButton({ status, selection, isAllPagesSelected, totalSelected }: Props) {
  const { t } = useTranslation();
  const formId = useId();
  const [open, setOpen] = useState(false);
  const { i18nKey, icon: Icon, color } = statuses[status];

  return (
    <>
      <Button variant="secondary" size="sm" iconLeft={Icon} iconClassName={color} onClick={() => setOpen(true)}>
        {t(i18nKey)}
      </Button>

      <Modal
        title={<DeliberateModalTitle {...{ label: t(i18nKey), color, totalSelected }} />}
        open={open}
        onClose={() => setOpen(false)}
      >
        <Modal.Content>
          <Form id={formId} method="POST" onSubmit={() => setOpen(false)}>
            <Callout title={t('common.warning')} variant="warning">
              {t('event-management.proposals.deliberate.modal.description')}
            </Callout>
            <input type="hidden" name="deliberationStatus" value={status} />
            <input type="hidden" name="allPagesSelected" value={String(isAllPagesSelected)} />
            {selection.map((id) => (
              <input key={id} type="hidden" name="selection" value={id} />
            ))}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form={formId}>
            {t('event-management.proposals.deliberate.modal.submit', { label: t(i18nKey) })}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

type ModalTitleProps = {
  label: string;
  color: string;
  totalSelected: number;
};

function DeliberateModalTitle({ label, color, totalSelected }: ModalTitleProps) {
  return (
    <Text size="base" weight="semibold" mb={4}>
      <Trans
        i18nKey="event-management.proposals.deliberate.modal.title"
        values={{ totalSelected, label }}
        components={[<span key="1" className={color} />]}
      />
    </Text>
  );
}
