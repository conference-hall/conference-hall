import { redirect } from 'react-router';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import type { Route } from './+types/profile.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Security | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  const withEmailPasswordSignin = await flags.get('emailPasswordSignin');
  if (!withEmailPasswordSignin) return redirect('/speaker/profile');
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;
  console.log({ intent, userId });
  return toast('success', 'Profile updated.');
};

export default function SecurityRoute() {
  return (
    <div className="space-y-4 lg:space-y-6 lg:col-span-9">
      <H1 srOnly>Security</H1>

      <div>Security</div>
    </div>
  );
}
