import { useTranslation } from 'react-i18next';
import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { H2, H3, Subtitle } from '~/design-system/typography.tsx';
import { AuthorizedEventContext } from '~/shared/authorization/authorization.middleware.ts';
import { CUSTOM_EMAIL_TEMPLATES } from '~/shared/emails/email.types.ts';
import { SUPPORTED_LANGUAGES } from '~/shared/i18n/i18n.ts';
import type { Route } from './+types/emails.ts';
import { EmailCustomBadge } from './components/email-custom-badge.tsx';
import { EventEmailCustomizations } from './services/event-email-customizations.server.tsx';

export const loader = async ({ context }: Route.LoaderArgs) => {
  const authorizedEvent = context.get(AuthorizedEventContext);
  const emailCustomizations = EventEmailCustomizations.for(authorizedEvent);
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
          <div key={template} className="space-y-3 rounded-lg border border-slate-200 p-4">
            <div>
              <H3 weight="medium">{t(`event-management.settings.emails.types.${template}`)}</H3>
              <Subtitle size="xs">{t(`event-management.settings.emails.descriptions.${template}`)}</Subtitle>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {SUPPORTED_LANGUAGES.map((locale) => {
                const customized = customizations.some((c) => c.template === template && c.locale === locale);

                return (
                  <div key={locale} className="flex items-center justify-between rounded-md bg-slate-50 p-3">
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
