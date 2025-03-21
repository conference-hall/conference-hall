import { parseWithZod } from '@conform-to/zod';
import * as Firebase from 'firebase/auth';
import { useEffect, useState } from 'react';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { EmailSchema, UnlinkProviderSchema } from '~/.server/speaker-profile/speaker-profile.types.ts';
import { H1 } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { requireSession, sendEmailVerification } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useSpeakerProfile } from '~/routes/components/contexts/speaker-profile-context.tsx';
import type { Route } from './+types/account.route.ts';
import { AuthenticationMethodsForm } from './account/authentication-methods-form.tsx';
import { ChangeContactEmailForm } from './account/change-contact-email-form.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Account | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  const withEmailPasswordSignin = await flags.get('emailPasswordSignin');
  return { withEmailPasswordSignin };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;

  switch (intent) {
    case 'change-contact-email': {
      const result = parseWithZod(form, { schema: EmailSchema });
      if (result.status !== 'success') return toast('error', 'An error occurred.');
      await SpeakerProfile.for(userId).save(result.value);
      return toast('success', 'Contact email changed.');
    }
    case 'unlink-provider': {
      const result = parseWithZod(form, { schema: UnlinkProviderSchema });
      if (result.status !== 'success') return toast('error', 'An error occurred.');
      if (result.value.newEmail) {
        await SpeakerProfile.for(userId).save({ email: result.value.newEmail });
      }
      return toast('success', 'Authentication method unlinked.');
    }
    case 'verify-email': {
      await sendEmailVerification(request);
      return toast('success', 'Verification email sent');
    }
    default:
      return null;
  }
};

export default function AccountRoute({ loaderData }: Route.ComponentProps) {
  const [authLoaded, setAuthLoaded] = useState(false);
  const { withEmailPasswordSignin } = loaderData;
  const { email } = useSpeakerProfile();

  useEffect(() => {
    // Listen to auth state changes to load the user auth state
    Firebase.onAuthStateChanged(getClientAuth(), (user) => {
      if (!user) return setAuthLoaded(false);
      setAuthLoaded(true);
    });
  }, []);

  return (
    <div className="space-y-4 lg:space-y-6 lg:col-span-9">
      <H1 srOnly>Account & Security</H1>

      <ChangeContactEmailForm email={email} authLoaded={authLoaded} />

      {withEmailPasswordSignin ? <AuthenticationMethodsForm email={email} authLoaded={authLoaded} /> : null}
    </div>
  );
}
