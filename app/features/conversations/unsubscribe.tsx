import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Card } from '~/design-system/layouts/card.tsx';
import { Page } from '~/design-system/layouts/page.tsx';
import { Link } from '~/design-system/links.tsx';
import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import type { Route } from './+types/unsubscribe.ts';
import { verifyUnsubscribeToken } from './services/unsubscribe-token.server.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Unsubscribe | Conference Hall' }]);
};

// Unauthenticated one-click unsubscribe. A valid HMAC token flips the digest preference off — the same
// field the settings toggle controls — so the two stay consistent. An invalid token changes nothing.
export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const token = url.searchParams.get('token') ?? '';
  const userId = verifyUnsubscribeToken(token);

  if (!userId) return { success: false };

  await UserAccount.for(userId).setConversationDigestEnabled(false);
  return { success: true };
};

export default function UnsubscribeRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { success } = loaderData;

  return (
    <Page>
      <header className="flex flex-col items-center pt-8 sm:mx-auto sm:w-full sm:max-w-md sm:pt-16">
        <ConferenceHallLogo width="48px" height="48px" aria-hidden className="fill-slate-300" />
      </header>

      <Card className="mt-10 space-y-8 p-6 sm:mx-auto sm:w-full sm:max-w-lg sm:p-12">
        {success ? (
          <CheckCircleIcon className="mx-auto size-16 text-green-500" />
        ) : (
          <XCircleIcon className="mx-auto size-16 text-red-400" />
        )}
        <div className="flex flex-col items-center gap-4">
          <Subtitle align="center" weight="semibold">
            {success ? t('unsubscribe.conversation-digest.success') : t('unsubscribe.conversation-digest.error')}
          </Subtitle>
        </div>
      </Card>

      <footer className="my-8 flex justify-center gap-1">
        <Link to={href('/')} weight="semibold">
          {t('unsubscribe.back-home')}
        </Link>
      </footer>
    </Page>
  );
}
