import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { XIcon } from '~/design-system/icons/x-icon.tsx';
import { Text } from '~/design-system/typography.tsx';
import { authClient, PROVIDERS, type ProviderId } from '~/shared/better-auth/auth-client.ts';

type AuthProvidersSigninProps = { redirectTo: string; showDeprecated?: boolean };

export function AuthProvidersSignin({ redirectTo, showDeprecated }: AuthProvidersSigninProps) {
  const { t } = useTranslation();

  const signIn = async (provider: ProviderId) => {
    await authClient.signIn.social({ provider, callbackURL: redirectTo, errorCallbackURL: href('/auth/error') });
  };

  return (
    <div className="flex flex-col gap-4">
      {PROVIDERS.map(({ id, label, icon: Icon }) => (
        <Button key={id} type="button" onClick={() => signIn(id)} iconLeft={Icon} variant="secondary">
          {t('auth.signin.auth-provider', { label })}
        </Button>
      ))}
      {showDeprecated ? <DeprecatedTwitterProvider /> : null}
    </div>
  );
}

function DeprecatedTwitterProvider() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <Button type="button" onClick={onOpen} iconLeft={XIcon} variant="secondary">
        {t('auth.signin.auth-provider', { label: 'X.com' })}
      </Button>

      <Modal title={t('auth.signin.auth-provider.twitter-deprecated.title')} size="l" open={open} onClose={onClose}>
        <Modal.Content className="space-y-4">
          <Text>
            <Trans i18nKey="auth.signin.auth-provider.twitter-deprecated.content" components={[<strong key="0" />]} />
          </Text>
        </Modal.Content>
        <Modal.Actions>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button to={href('/auth/forgot-password')} onClick={onClose}>
            {t('auth.signin.auth-provider.twitter-deprecated.action')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}
