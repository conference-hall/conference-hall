import { CheckIcon } from '@heroicons/react/16/solid';
import * as Firebase from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Button } from '~/design-system/button.tsx';
import { getClientAuth, type ProviderId } from '~/shared/authentication/firebase.ts';

type LinkProviderProps = { providerId: ProviderId };

export function LinkProvider({ providerId }: LinkProviderProps) {
  const { t } = useTranslation();

  const linkProvider = async () => {
    const { currentUser } = getClientAuth();
    if (!currentUser) return;
    switch (providerId) {
      case 'google.com':
        return Firebase.linkWithRedirect(currentUser, new Firebase.GoogleAuthProvider());
      case 'github.com':
        return Firebase.linkWithRedirect(currentUser, new Firebase.GithubAuthProvider());
      case 'twitter.com':
        return Firebase.linkWithRedirect(currentUser, new Firebase.TwitterAuthProvider());
      default:
        console.error('Unknown provider', providerId);
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={linkProvider} size="sm">
      {t('settings.account.authentication-methods.link-button')}
    </Button>
  );
}

type UnlinkProviderProps = {
  providerId: ProviderId | 'password';
  disabled?: boolean;
  onUnlink: (providerId: ProviderId | 'password') => Promise<void>;
};

export function UnlinkProvider({ providerId, disabled, onUnlink }: UnlinkProviderProps) {
  const { t } = useTranslation();

  const unlinkProvider = async () => {
    if (disabled) return;
    const confirm = window.confirm(t('settings.account.authentication-methods.confirm-unlink'));
    if (!confirm) return;
    const { currentUser } = getClientAuth();
    if (!currentUser) return;
    await Firebase.unlink(currentUser, providerId);
    await onUnlink(providerId);
  };

  return (
    <Button
      type="button"
      variant={disabled ? 'secondary' : 'important'}
      onClick={unlinkProvider}
      iconLeft={disabled ? CheckIcon : undefined}
      disabled={disabled}
      size="sm"
    >
      {disabled
        ? t('settings.account.authentication-methods.account-linked')
        : t('settings.account.authentication-methods.unlink-button')}
    </Button>
  );
}
