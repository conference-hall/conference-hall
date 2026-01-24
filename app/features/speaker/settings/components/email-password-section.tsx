import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Turnstile } from '@marsidev/react-turnstile';
import { useId, useState, type FormEvent } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { toast } from 'sonner';
import { Button } from '~/design-system/button.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { InputPassword } from '~/design-system/forms/input-password.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { List } from '~/design-system/list/list.tsx';
import { H2, Subtitle, Text } from '~/design-system/typography.tsx';
import { authClient, getAuthError } from '~/shared/better-auth/auth-client.ts';
import { useNonce } from '~/shared/nonce/use-nonce.ts';
import type { I18nSubmissionErrors } from '~/shared/types/errors.types.ts';
import { validatePassword } from '~/shared/validators/auth.ts';

type Props = { email: string; hasPassword: boolean; captchaSiteKey?: string };

export function EmailPasswordSection({ email, hasPassword, captchaSiteKey }: Props) {
  const { t } = useTranslation();

  const [openEmail, setOpenEmail] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('settings.account.email.heading')}</H2>
        <Subtitle>{t('settings.account.email.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        <List>
          <List.Content aria-label={t('settings.account.authentication-methods.list')}>
            <List.Row className="min-h-16 flex-col justify-between gap-4 p-4 sm:flex-row">
              <div className="flex items-center gap-4">
                <EnvelopeIcon className="size-5 shrink-0" aria-hidden="true" />
                <Text weight="semibold">{email}</Text>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpenEmail(true)}>
                {t('common.edit')}
              </Button>
              <ChangeEmailModal email={email} open={openEmail} onClose={() => setOpenEmail(false)} />
            </List.Row>

            <List.Row className="min-h-16 flex-col justify-between gap-4 p-4 sm:flex-row">
              <div className="flex items-center gap-4">
                <KeyIcon className="size-5 shrink-0" aria-hidden="true" />
                {hasPassword ? (
                  <Text weight="semibold">{t('common.password.placeholder')}</Text>
                ) : (
                  <Text variant="secondary" className="italic">
                    {t('settings.account.email.no-password')}
                  </Text>
                )}
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setOpenPassword(true)}>
                {hasPassword ? t('common.edit') : t('common.add')}
              </Button>
              {hasPassword ? (
                <ChangePasswordModal open={openPassword} onClose={() => setOpenPassword(false)} />
              ) : (
                <AddPasswordModal
                  email={email}
                  captchaSiteKey={captchaSiteKey}
                  open={openPassword}
                  onClose={() => setOpenPassword(false)}
                />
              )}
            </List.Row>
          </List.Content>
        </List>
      </Card.Content>
    </Card>
  );
}

type ChangeEmailModalProps = { email: string; open: boolean; onClose: VoidFunction };

function ChangeEmailModal({ email, open, onClose }: ChangeEmailModalProps) {
  const { t } = useTranslation();
  const formId = useId();

  const [newEmail, setNewEmail] = useState('');

  const onChangeEmail = async (event: FormEvent) => {
    event.preventDefault();
    if (newEmail === email) return;
    const { error } = await authClient.changeEmail({ newEmail, callbackURL: '/speaker/settings' });
    if (!error) {
      toast.success(t('settings.account.feedbacks.email-link-sent', { email: newEmail }));
      onClose();
    } else {
      toast.error(t(getAuthError(error)));
    }
  };

  return (
    <Modal title={t('settings.account.email.change-email.title')} onClose={onClose} open={open}>
      <Modal.Content className="space-y-4">
        <div className="flex gap-1">
          <Text variant="secondary">{t('settings.account.email.change-email.current-email')}</Text>
          <Text>{email}</Text>
        </div>
        <Form id={formId} onSubmit={onChangeEmail} className="space-y-4">
          <Input
            type="email"
            label={t('settings.account.email.change-email.new-email-label')}
            placeholder={t('common.email.placeholder')}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </Form>
        <Callout>{t('settings.account.email.change-email.callout')}</Callout>
      </Modal.Content>
      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" form={formId} disabled={!newEmail}>
          {t('settings.account.email.change-email.send-link')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

type AddPasswordModalProps = { email: string; open: boolean; captchaSiteKey?: string; onClose: VoidFunction };

function AddPasswordModal({ email, captchaSiteKey, open, onClose }: AddPasswordModalProps) {
  const { t } = useTranslation();

  const [captchaToken, setCaptchaToken] = useState<string>('');
  const nonce = useNonce();

  const isLoading = Boolean(captchaSiteKey && !captchaToken);

  const onAddPassword = async (event: FormEvent) => {
    event.preventDefault();
    const { error } = await authClient.requestPasswordReset(
      { email, redirectTo: '/auth/reset-password' },
      { headers: captchaSiteKey ? { 'x-captcha-response': captchaToken } : undefined },
    );
    if (!error) {
      toast.success(t('settings.account.feedbacks.email-link-sent', { email }));
      onClose();
    } else {
      toast.error(t(getAuthError(error)));
    }
  };

  return (
    <Modal title={t('settings.account.email.set-password.title')} onClose={onClose} open={open}>
      <Modal.Content className="space-y-4">
        <Text>
          <Trans i18nKey="settings.account.email.set-password.description" values={{ email }}>
            You will receive a link at <strong>{'{{email}}'}</strong> to create your password.
          </Trans>
        </Text>
        {captchaSiteKey && (
          <Turnstile
            siteKey={captchaSiteKey}
            onSuccess={setCaptchaToken}
            onError={() => setCaptchaToken('')}
            onExpire={() => setCaptchaToken('')}
            options={{ theme: 'light', size: 'invisible' }}
            scriptOptions={{ nonce }}
            className="hidden"
            aria-hidden
          />
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="button" variant="primary" onClick={onAddPassword} disabled={isLoading} loading={isLoading}>
          {t('settings.account.email.set-password.send-link')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

type ChangePasswordModalProps = { open: boolean; onClose: VoidFunction };

function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const formId = useId();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<I18nSubmissionErrors>(null);
  const disabled = !currentPassword || !newPassword;

  const onChangePassword = async (event: FormEvent) => {
    event.preventDefault();

    const fieldErrors = validatePassword(newPassword);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    const { error } = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
    if (!error) {
      toast.success(t('settings.account.feedbacks.password-changed'));
      onClose();
    } else {
      toast.error(t(getAuthError(error)));
    }
  };

  return (
    <Modal title={t('settings.account.email.change-password.title')} onClose={onClose} open={open}>
      <Modal.Content className="space-y-4">
        <Form id={formId} onSubmit={onChangePassword} className="space-y-4">
          <InputPassword
            name="oldPassword"
            label={t('settings.account.email.change-password.current-password')}
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <InputPassword
            name="newPassword"
            label={t('settings.account.email.change-password.new-password')}
            value={newPassword}
            onChange={setNewPassword}
            isNewPassword
            error={fieldErrors?.password?.map((e) => t(e))}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="primary" form={formId} disabled={disabled}>
          {t('common.edit')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
