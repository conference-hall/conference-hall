import { useTranslation } from 'react-i18next';
import { Form, data } from 'react-router';
import { UserAccount } from '~/.server/user-registration/user-account.ts';
import { Button } from '~/design-system/buttons.tsx';
import { SelectNative } from '~/design-system/forms/select-native.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H1, H2, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { i18n, setLocaleCookie } from '~/libs/i18n/i18n.server.ts';
import { SUPPORTED_LOCALES } from '~/libs/i18n/i18n.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast, toastHeaders } from '~/libs/toasts/toast.server.ts';
import { combineHeaders } from '~/libs/utils/headers.ts';
import type { Route } from './+types/preferences.route.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Preferences | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  const locale = await i18n.getLocale(request);
  return { locale };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const form = await request.formData();
  const locale = form.get('locale') as string;
  if (!locale) return toast('error', 'An error occurred.');

  await UserAccount.changeLocale(userId, locale);

  const t = await i18n.getFixedT(locale);
  return data(null, {
    headers: combineHeaders(
      await setLocaleCookie(locale),
      await toastHeaders('success', t('settings.preferences.success')),
    ),
  });
};

const LOCALES = Object.entries(SUPPORTED_LOCALES).map(([key, value]) => ({ name: value, value: key }));

export default function PreferencesRoute({ loaderData }: Route.ComponentProps) {
  const { locale } = loaderData;
  const { t } = useTranslation();

  return (
    <div className="space-y-4 lg:space-y-6 ">
      <H1 srOnly>Preferences</H1>

      <Card as="section">
        <Card.Title>
          <H2 id="language">{t('language')}</H2>
          <Subtitle>Select the language for the user interface</Subtitle>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id="language-form" aria-labelledby="language" preventScrollReset>
            <SelectNative name="locale" label={t('language')} defaultValue={locale} options={LOCALES} />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" form="language-form">
            Change language
          </Button>
        </Card.Actions>
      </Card>
    </div>
  );
}
