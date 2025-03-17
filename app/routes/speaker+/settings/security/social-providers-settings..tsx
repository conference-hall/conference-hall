import { CheckIcon } from '@heroicons/react/16/solid';
import * as Firebase from 'firebase/auth';
import { Button } from '~/design-system/buttons.tsx';
import { type ProviderId, getClientAuth } from '~/libs/auth/firebase.ts';

type LinkProviderProps = { providerId: ProviderId };

export function LinkProvider({ providerId }: LinkProviderProps) {
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
    <Button type="button" variant="secondary" onClick={linkProvider} size="s">
      Link account
    </Button>
  );
}

type UnlinkProviderProps = {
  providerId: ProviderId | 'password';
  disabled?: boolean;
  onUnlink: (providerId: ProviderId | 'password') => void;
};

export function UnlinkProvider({ providerId, disabled, onUnlink }: UnlinkProviderProps) {
  const unlinkProvider = async () => {
    const confirm = window.confirm('Are you sure you want to unlink this account?');
    if (!confirm) return;

    if (disabled) return;
    const { currentUser } = getClientAuth();
    if (!currentUser) return;
    await Firebase.unlink(currentUser, providerId);
    onUnlink(providerId);
  };

  return (
    <Button
      type="button"
      variant={disabled ? 'secondary' : 'important'}
      onClick={unlinkProvider}
      iconLeft={disabled ? CheckIcon : undefined}
      disabled={disabled}
      size="s"
    >
      {disabled ? 'Account linked' : 'Unlink account'}
    </Button>
  );
}
