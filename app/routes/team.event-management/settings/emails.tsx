import { useTranslation } from 'react-i18next';
import { EventEmailCustomizations } from '~/.server/event-settings/event-email-customizations.ts';
import { Card } from '~/design-system/layouts/card.tsx';
import { Link } from '~/design-system/links.tsx';
import { H2, H3, Subtitle } from '~/design-system/typography.tsx';
import { CUSTOM_TEMPLATES } from '~/emails/email.types.ts';
import { requireUserSession } from '~/libs/auth/session.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { SUPPORTED_LANGUAGES } from '~/libs/i18n/i18n.ts';
import { useCurrentEvent } from '~/routes/components/contexts/event-team-context.tsx';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { EmailCustomBadge } from '../components/settings-page/email-custom-badge.tsx';
import type { Route } from './+types/emails.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);

  const emailCustomizationEnabled = await flags.get('emailCustomization');
  if (!emailCustomizationEnabled) {
    throw new Response('Not Found', { status: 404 });
  }

  const emailCustomizations = EventEmailCustomizations.for(userId, params.team, params.event);
  const customizations = await emailCustomizations.list();

  return { customizations };
};

export default function EventEmailsSettingsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const currentEvent = useCurrentEvent();
  const { customizations } = loaderData;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.emails.heading')}</H2>
        <Subtitle>{t('event-management.settings.emails.description')}</Subtitle>
      </Card.Title>

      <Card.Content>
        {CUSTOM_TEMPLATES.map((template) => (
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
                      to={`/team/${currentTeam.slug}/${currentEvent.slug}/settings/emails/${template}?locale=${locale}`}
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
