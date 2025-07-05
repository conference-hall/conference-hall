import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Modal } from '~/shared/design-system/dialogs/modals.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { MarkdownTextArea } from '~/shared/design-system/forms/markdown-textarea.tsx';

type CustomizationProps = {
  template: string;
  locale: string;
  customization: {
    subject: string | null;
    content: string | null;
  } | null;
  defaults: {
    subject: string;
  };
};

export function ResetTemplateButton({ template, locale, customization }: CustomizationProps) {
  const { t } = useTranslation();

  if (!customization) return null;
  return (
    <Form method="POST">
      <input type="hidden" name="template" value={template} />
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" name="intent" value="reset" variant="important">
        {t('event-management.settings.emails.form.reset')}
      </Button>
    </Form>
  );
}

export function EditTemplateButton(props: CustomizationProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {t('event-management.settings.emails.edit.button')}
      </Button>
      <EmailCustomModal {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

type EmailCustomModalProps = CustomizationProps & {
  open: boolean;
  onClose: VoidFunction;
};

function EmailCustomModal({ template, locale, customization, defaults, open, onClose }: EmailCustomModalProps) {
  const formId = useId();
  const { t } = useTranslation();

  return (
    <Modal title={t('event-management.settings.emails.edit.title')} size="l" open={open} onClose={onClose}>
      <Modal.Content>
        <Form id={formId} method="POST" className="space-y-4" onSubmit={onClose}>
          <input type="hidden" name="template" value={template} />
          <input type="hidden" name="locale" value={locale} />

          <Input
            name="subject"
            label={t('event-management.settings.emails.form.subject.label')}
            placeholder={defaults.subject}
            defaultValue={customization?.subject || ''}
          />

          <MarkdownTextArea
            name="content"
            label={t('event-management.settings.emails.form.content.label')}
            description={t('event-management.settings.emails.form.content.description')}
            defaultValue={customization?.content || ''}
            rows={12}
            preview={false}
          />
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" name="intent" value="save" form={formId}>
          {t('event-management.settings.emails.form.save')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
