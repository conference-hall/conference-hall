import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { Form, redirect, useNavigation, useSearchParams } from 'react-router';
import { z } from 'zod';
import { UserAccount } from '~/.server/user-registration/user-account.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { getUserSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/forgot-password.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Forgot password | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const userId = await getUserSession(request);
  if (userId) return redirect('/');
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const email = z.string().email().parse(form.get('email'));
  await UserAccount.sendResetPasswordEmail(email);
  return { emailSent: true };
};

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const { emailSent } = actionData || {};
  const [searchParams] = useSearchParams();
  const defaultEmail = searchParams.get('email') || '';
  const loading = navigation.state !== 'idle';

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {emailSent ? 'Password reset email sent!' : 'Forgot your password?'}
        </h2>
      </header>

      {emailSent ? (
        <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
          <EnvelopeIcon className="size-16 mx-auto text-slate-300" />
          <div className="flex flex-col items-center gap-4">
            <Subtitle align="center">
              If an account with that email exists, we sent you an email with instructions to reset your password.
            </Subtitle>
            <Subtitle align="center" weight="semibold">
              Please check your inbox.
            </Subtitle>
          </div>
        </Card>
      ) : (
        <Card className="p-6 mt-10 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12 space-y-8">
          <Subtitle>Enter your email address and we will send you a link to reset your password.</Subtitle>

          <Form method="POST" className="space-y-4">
            <Input
              label="Email address"
              placeholder="example@site.com"
              name="email"
              type="email"
              defaultValue={defaultEmail}
              required
            />
            <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
              {loading ? <LoadingIcon className="size-4" /> : 'Send reset password email'}
            </Button>
          </Form>
        </Card>
      )}
    </Page>
  );
}
