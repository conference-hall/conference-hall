import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { data, Form } from 'react-router';
import { UserAccount } from '~/.server/user-registration/user-account.ts';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { requireUserSession } from '~/shared/auth/session.ts';
import { Button } from '~/shared/design-system/buttons.tsx';
import { SelectNative } from '~/shared/design-system/forms/select-native.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H1, H2, Subtitle } from '~/shared/design-system/typography.tsx';
import { i18n, setLocaleCookie } from '~/shared/i18n/i18n.server.ts';
import { SUPPORTED_LANGUAGES } from '~/shared/i18n/i18n.ts';
import { toastHeaders } from '~/shared/toasts/toast.server.ts';
import { combineHeaders } from '~/shared/utils/headers.ts';
import type { Route } from './+types/settings.preferences.ts';

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

  await UserAccount.changeLocale(userId, locale);

  const t = await i18n.getFixedT(locale);
  return data(null, {
    headers: combineHeaders(
      await setLocaleCookie(locale),
      await toastHeaders('success', t('settings.preferences.saved')),
    ),
  });
};

export default function PreferencesRoute({ loaderData }: Route.ComponentProps) {
  const { locale } = loaderData;
  const { t } = useTranslation();
  const formId = useId();

  const locales = SUPPORTED_LANGUAGES.map((locale) => ({
    name: t(`settings.preferences.language.${locale}`),
    value: locale,
  }));

  return (
    <div className="space-y-4 lg:space-y-6 ">
      <H1 srOnly>{t('settings.preferences')}</H1>

      <Card as="section">
        <Card.Title>
          <H2>{t('settings.preferences.language')}</H2>
          <Subtitle>{t('settings.preferences.language.subtitle')}</Subtitle>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id={formId} aria-labelledby="language" preventScrollReset>
            <SelectNative
              name="locale"
              label={t('settings.preferences.language')}
              defaultValue={locale}
              options={locales}
            />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" form={formId}>
            {t('settings.preferences.language.save')}
          </Button>
        </Card.Actions>
      </Card>
    </div>
  );
}
