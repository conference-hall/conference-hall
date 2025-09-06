import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import type { SelectPanelOption } from '~/design-system/forms/select-panel.tsx';
import { TextArea } from '~/design-system/forms/textarea.tsx';

type SpeakerModalProps = {
  team: string;
  event: string;
  onSpeakerCreated?: (speaker: SelectPanelOption) => void;
  children: ({ onOpen }: { onOpen: () => void }) => React.ReactNode;
};

export function SpeakerModal({ team, event, onSpeakerCreated, children }: SpeakerModalProps) {
  const { t } = useTranslation();
  const [isModalOpen, setModalOpen] = useState(false);

  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  const formId = useId();
  const isLoading = fetcher.state === 'submitting';
  const errors = fetcher.data?.errors;

  const handleSubmit = () => {
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    formData.append('intent', 'create-speaker');
    fetcher.submit(formData, { method: 'POST', action: `/team/${team}/${event}/reviews/new` });
  };

  useEffect(() => {
    if (fetcher.data?.speaker && !errors && isModalOpen) {
      const speaker = fetcher.data.speaker;
      onSpeakerCreated?.({
        value: speaker.id,
        label: speaker.name,
        picture: speaker.picture,
        data: { description: speaker.company },
      });
      setModalOpen(false);
    }
  }, [fetcher.data?.speaker, errors, isModalOpen, onSpeakerCreated]);

  const onClose = () => setModalOpen(false);
  const onOpen = () => setModalOpen(true);

  return (
    <>
      {children({ onOpen })}

      <Modal
        title={t('event-management.proposals.new.speaker-modal.create')}
        size="l"
        open={isModalOpen}
        onClose={onClose}
      >
        <Modal.Content>
          <Form ref={formRef} id={formId} className="space-y-4 lg:space-y-6">
            <Input name="email" type="email" label={t('common.email')} error={errors?.email} required />

            <Input name="name" label={t('common.full-name')} error={errors?.name} required />

            <Input name="company" label={t('speaker.profile.company')} error={errors?.company} />

            <TextArea name="bio" label={t('speaker.profile.biography')} error={errors?.bio} rows={4} />
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button onClick={onClose} type="button" variant="secondary" disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} type="button" disabled={isLoading}>
            {isLoading
              ? t('event-management.proposals.new.speaker-modal.creating')
              : t('event-management.proposals.new.speaker-modal.create')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
