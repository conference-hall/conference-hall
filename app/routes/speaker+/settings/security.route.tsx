import { parseWithZod } from '@conform-to/zod';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { AccountInfoSchema } from '~/.server/speaker-profile/speaker-profile.types.ts';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession, sendEmailVerification } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useSpeakerProfile } from '~/routes/components/contexts/speaker-profile-context.tsx';
import type { Route } from './+types/security.route.ts';
import { AccountInfoForm } from './security/account-info-form.tsx';
import { AuthenticationMethodsForm } from './security/authentication-methods-form.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Account & Security | Conference Hall' }]);
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
    case 'account-info': {
      const result = parseWithZod(form, { schema: AccountInfoSchema });
      if (result.status !== 'success') return result.error;

      await SpeakerProfile.for(userId).save(result.value);
      return toast('success', 'Account information updated.');
    }
    case 'verify-email': {
      await sendEmailVerification(request);
      return toast('success', 'Verification email sent');
    }
    default:
      return null;
  }
};

export default function SecurityRoute({ loaderData, actionData: errors }: Route.ComponentProps) {
  const { withEmailPasswordSignin } = loaderData;

  const profile = useSpeakerProfile();

  return (
    <div className="space-y-4 lg:space-y-6 lg:col-span-9">
      <H1 srOnly>Account & Security</H1>

      <AccountInfoForm name={profile.name} email={profile.email} picture={profile.picture} errors={errors} />

      {withEmailPasswordSignin ? <AuthenticationMethodsForm /> : null}
    </div>
  );
}
