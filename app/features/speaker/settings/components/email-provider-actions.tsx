import { CheckIcon } from '@heroicons/react/16/solid';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { type FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, useSubmit } from 'react-router';
import { Button } from '~/shared/design-system/buttons.tsx';
import { Modal } from '~/shared/design-system/dialogs/modals.tsx';
import { Input } from '~/shared/design-system/forms/input.tsx';
import { PasswordInput } from '~/shared/design-system/forms/password-input.tsx';
import { Subtitle } from '~/shared/design-system/typography.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
import { validateEmailAndPassword } from '~/shared/validators/auth.ts';

export function NewEmailProviderModal() {
  const { t } = useTranslation();
  const formId = useId();
  const submit = useSubmit();
  const [open, setOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SubmissionErrors>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const linkAccount = async (event: FormEvent) => {
    event.preventDefault();
    const fieldErrors = validateEmailAndPassword(email, password);
    if (fieldErrors) return setFieldErrors(fieldErrors);
    await submit({ intent: 'link-email-provider', email, password }, { method: 'POST' });
  };

  return (
    <>
      <Button type="button" variant="secondary" size="s" onClick={() => setOpen(true)}>
        {t('settings.account.authentication-methods.link-button')}
      </Button>

      <Modal
        title={t('settings.account.authentication-methods.email-modal.title')}
        onClose={() => setOpen(false)}
        open={open}
      >
        <Modal.Content className="space-y-6">
          <Subtitle>{t('settings.account.authentication-methods.email-modal.description')}</Subtitle>
          <Form id={formId} onSubmit={linkAccount} className="space-y-4">
            <Input
              label={t('common.email')}
              placeholder={t('common.email.placeholder')}
              name="new-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors?.email}
              required
            />
            <PasswordInput value={password} onChange={setPassword} isNewPassword error={fieldErrors?.password} />
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" form={formId}>
            {t('settings.account.authentication-methods.link-button')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export function VerifyEmailButton() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const submit = useSubmit();

  const sendVerificationEmail = async () => {
    await submit({ intent: 'verify-email' }, { method: 'POST', navigate: false });
    setSent(true);
  };

  if (sent) {
    return (
      <Button type="button" variant="secondary" size="s" iconLeft={CheckIcon} disabled>
        {t('settings.account.authentication-methods.email-sent')}
      </Button>
    );
  }
  return (
    <Button type="button" variant="secondary" size="s" iconLeft={CheckBadgeIcon} onClick={sendVerificationEmail}>
      {t('settings.account.authentication-methods.send-verification-button')}
    </Button>
  );
}
