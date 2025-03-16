import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import type * as Firebase from 'firebase/auth';
import { Button } from '~/design-system/buttons.tsx';
import type { ProviderId } from '~/libs/auth/firebase.ts';
import { NewEmailProviderModal } from './email-provider-modals.tsx';
import { UnlinkProvider } from './social-providers-settings..tsx';

type Props = {
  passwordProvider?: Firebase.UserInfo;
  canUnlink: boolean;
  onUnlink: (providerId: ProviderId | 'password') => void;
};

export function EmailProviderSettings({ passwordProvider, canUnlink, onUnlink }: Props) {
  if (!passwordProvider) {
    return <NewEmailProviderModal />;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      <Button type="button" variant="secondary" size="s" iconLeft={EnvelopeIcon} className="grow">
        Change email
      </Button>
      <Button type="button" variant="secondary" size="s" iconLeft={KeyIcon} className="grow">
        Change password
      </Button>
      {canUnlink ? <UnlinkProvider providerId="password" onUnlink={onUnlink} /> : null}
    </div>
  );
}
