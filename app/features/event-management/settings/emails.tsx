import { useTranslation } from 'react-i18next';
import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { H2, H3, Subtitle } from '~/design-system/typography.tsx';
import { getRequiredAuthUser } from '~/shared/auth/auth.middleware.ts';
import { CUSTOM_EMAIL_TEMPLATES } from '~/shared/emails/email.types.ts';
import { SUPPORTED_LANGUAGES } from '~/shared/i18n/i18n.ts';
import type { Route } from './+types/emails.ts';
import { EmailCustomBadge } from './components/email-custom-badge.tsx';
import { EventEmailCustomizations } from './services/event-email-customizations.server.tsx';

export const loader = async ({ params, context }: Route.LoaderArgs) => {
  const authUser = getRequiredAuthUser(context);
  const emailCustomizations = EventEmailCustomizations.for(authUser.id, params.team, params.event);
  const customizations = await emailCustomizations.list();
  return { customizations };
};

export default function EventEmailsSettingsRoute({ params, loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { customizations } = loaderData;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.emails.heading')}</H2>
        <Subtitle>{t('event-management.settings.emails.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        {CUSTOM_EMAIL_TEMPLATES.map((template) => (
          <div key={template} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div>
              <H3 weight="medium">{t(`event-management.settings.emails.types.${template}`)}</H3>
              <Subtitle size="xs">{t(`event-management.settings.emails.descriptions.${template}`)}</Subtitle>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SUPPORTED_LANGUAGES.map((locale) => {
                const customized = customizations.some((c) => c.template === template && c.locale === locale);

                return (
                  <div key={locale} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                    <div className="flex items-center gap-2">
                      <span>{t(`common.languages.${locale}.flag`)}</span>
                      <EmailCustomBadge customized={customized} />
                    </div>
                    <Link
                      to={`/team/${params.team}/${params.event}/settings/emails/${template}?locale=${locale}`}
                      weight="medium"
                      size="xs"
                    >
                      {t('common.customize')}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}
