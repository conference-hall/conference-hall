import type * as Firebase from 'firebase/auth';
import type { ProviderId } from '~/libs/auth/firebase.ts';
import { ChangePasswordModal, NewEmailProviderModal, VerifyEmailButton } from './email-provider-actions.tsx';
import { UnlinkProvider } from './social-providers-settings..tsx';

type Props = {
  passwordProvider?: Firebase.UserInfo;
  emailVerified: boolean;
  canUnlink: boolean;
  onUnlink: (providerId: ProviderId | 'password') => void;
};

export function EmailProviderSettings({ passwordProvider, emailVerified, canUnlink, onUnlink }: Props) {
  if (!passwordProvider) {
    return <NewEmailProviderModal />;
  }

  if (!emailVerified) {
    return <VerifyEmailButton />;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      {passwordProvider.email ? <ChangePasswordModal email={passwordProvider.email} /> : null}
      {canUnlink ? <UnlinkProvider providerId="password" onUnlink={onUnlink} /> : null}
    </div>
  );
}
