import type * as Firebase from 'firebase/auth';
import type { ProviderId } from '~/shared/authentication/firebase.ts';
import { NewEmailProviderModal, VerifyEmailButton } from './email-provider-actions.tsx';
import { UnlinkProvider } from './social-providers-settings.tsx';

type Props = {
  passwordProvider?: Firebase.UserInfo;
  emailVerified: boolean;
  canUnlink: boolean;
  onUnlink: (providerId: ProviderId | 'password') => Promise<void>;
};

export function EmailProviderSettings({ passwordProvider, emailVerified, canUnlink, onUnlink }: Props) {
  if (!passwordProvider) {
    return <NewEmailProviderModal />;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      {!emailVerified ? <VerifyEmailButton /> : null}
      <UnlinkProvider providerId="password" onUnlink={onUnlink} disabled={!canUnlink} />
    </div>
  );
}
