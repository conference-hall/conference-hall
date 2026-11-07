import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, href, isRouteErrorResponse, redirect, useNavigate, useRouteError } from 'react-router';
import { GeneralErrorBoundary } from '~/app-platform/components/errors/error-boundary.tsx';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { H1, Subtitle, Text } from '~/design-system/typography.tsx';
import { authClient } from '~/shared/authentication/auth-client.ts';
import { RequireAuthContext, requireAuth } from '~/shared/authentication/auth.middleware.ts';
import type { Route } from './+types/submission-pass.ts';
import { SubmissionPassClaim } from './services/submission-pass-claim.server.ts';

export const middleware = [requireAuth];

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Submission pass | Conference Hall' }]);
};

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = context.get(RequireAuthContext);
  const { event, alreadyHolds } = await SubmissionPassClaim.with(params.code).check(authUser.id);
  if (alreadyHolds) throw redirect(href('/:event/submission', { event: event.slug }));
  return { event, user: { name: authUser.name, email: authUser.email, picture: authUser.picture } };
};

export const action = async ({ params, context }: Route.ActionArgs) => {
  const authUser = context.get(RequireAuthContext);
  const { event } = await SubmissionPassClaim.with(params.code).claim(authUser.id);
  return redirect(href('/:event/submission', { event: event.slug }));
};

export default function SubmissionPassRoute({ loaderData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { event, user } = loaderData;

  const switchAccount = async () => {
    const redirectTo = href('/invite/pass/:code', { code: params.code });
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate(`${href('/auth/login')}?redirectTo=${encodeURIComponent(redirectTo)}`),
      },
    });
  };

  return (
    <ClaimLayout
      header={
        <>
          <Avatar picture={event.logoUrl} name={event.name} size="4xl" square />
          <div>
            <H1 size="2xl" weight="bold">
              {event.name}
            </H1>
            <Subtitle>{t('event.submission-pass.claim.invitation')}</Subtitle>
          </div>
        </>
      }
    >
      <div className="space-y-4 p-6 sm:p-8">
        <Text variant="secondary">{t('event.submission-pass.claim.description')}</Text>
        <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 ring-1 ring-gray-200">
          <Avatar picture={user.picture} name={user.name} size="m" />
          <div className="min-w-0 grow">
            <Text weight="medium">{user.name}</Text>
            <Text size="xs" variant="secondary" truncate>
              {user.email}
            </Text>
          </div>
          <Button variant="tertiary" size="xs" onClick={switchAccount}>
            {t('event.submission-pass.claim.switch-account')}
          </Button>
        </div>
      </div>
      <Form method="POST" className="flex justify-end border-t border-gray-200 p-4">
        <Button type="submit">{t('event.submission-pass.claim.submit')}</Button>
      </Form>
    </ClaimLayout>
  );
}

export function ErrorBoundary() {
  const { t } = useTranslation();
  const error = useRouteError();

  if (!isRouteErrorResponse(error) || ![403, 404].includes(error.status)) return <GeneralErrorBoundary />;

  const claimed = error.status === 403;
  return (
    <ClaimLayout header={<ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />}>
      <div className="flex flex-col items-center gap-4 p-6 text-center sm:p-8">
        <H1 size="xl" weight="bold">
          {claimed
            ? t('event.submission-pass.claim.errors.claimed.heading')
            : t('event.submission-pass.claim.errors.not-found.heading')}
        </H1>
        <Subtitle>
          {claimed
            ? t('event.submission-pass.claim.errors.claimed.description')
            : t('event.submission-pass.claim.errors.not-found.description')}
        </Subtitle>
        <Button to="/" className="mt-4">
          {t('common.go-to-home')}
        </Button>
      </div>
    </ClaimLayout>
  );
}

function ClaimLayout({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <Page>
      <header className="flex flex-col items-center gap-4 pt-8 text-center sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        {header}
      </header>
      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">{children}</Card>
    </Page>
  );
}
