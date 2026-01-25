import type { ReactNode } from 'react';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import type { Languages } from '~/shared/types/proposals.types.ts';
import { Badge } from '~/design-system/badges.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H1, Subtitle, Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDatetime } from '~/shared/datetimes/datetimes.ts';
import type { TalkLevel } from '../../../../../prisma/generated/client.ts';
import type { SpeakerProps } from './speakers.tsx';
import { Speakers } from './speakers.tsx';

type Props = {
  talk: {
    id: string;
    title: string;
    abstract: string;
    references: string | null;
    level: TalkLevel | null;
    languages: Languages;
    routeId?: string;
    speakers: Array<SpeakerProps>;
    invitationLink?: string;
    archived?: boolean;
    archivedAt?: Date | null;
    formats?: Array<{ id: string; name: string }>;
    categories?: Array<{ id: string; name: string }>;
    createdAt?: Date;
    submittedAt?: Date;
  };
  actions?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  canEditSpeakers?: boolean;
  showSpeakers?: boolean;
  showFormats?: boolean;
  showCategories?: boolean;
  referencesOpen?: boolean;
};

export function TalkSection({
  talk,
  children,
  action,
  actions,
  canEditSpeakers = false,
  showSpeakers = false,
  showFormats = false,
  showCategories = false,
  referencesOpen = false,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <Card as="section">
      <div
        className={cx('gap-4 border-b border-b-gray-200 p-3 pl-6', {
          'flex flex-col justify-between sm:flex-row sm:items-center': Boolean(actions),
          'flex items-center justify-between': Boolean(action),
        })}
      >
        <H1 size="base" className="space-x-2">
          <span>{talk.title}</span>
          {talk.routeId ? (
            <Text as="span" variant="secondary" size="base">
              #{talk.routeId}
            </Text>
          ) : null}
        </H1>

        {action ? (
          action
        ) : actions ? (
          <div className="flex flex-row items-center gap-3 sm:justify-between">{actions}</div>
        ) : null}
      </div>

      <div className="flex gap-4 px-6 py-4">
        {showSpeakers ? (
          <Speakers
            speakers={talk.speakers}
            invitationLink={talk.invitationLink}
            canEdit={canEditSpeakers && !talk.archived}
            className="grow"
          />
        ) : null}

        <div className="flex gap-1">
          <ClientOnly>
            {() =>
              talk.createdAt ? (
                <Subtitle size="xs">
                  {t('common.created-on', {
                    date: formatDatetime(talk.createdAt, { format: 'short', locale }),
                    interpolation: { escapeValue: false },
                  })}
                </Subtitle>
              ) : null
            }
          </ClientOnly>

          <ClientOnly>
            {() =>
              talk.submittedAt ? (
                <Subtitle size="xs">
                  {t('common.submitted-on', {
                    date: formatDatetime(talk.submittedAt, { format: 'short', locale }),
                    interpolation: { escapeValue: false },
                  })}
                </Subtitle>
              ) : null
            }
          </ClientOnly>

          <ClientOnly>
            {() =>
              talk.archivedAt ? (
                <Subtitle size="xs">
                  {` - ${t('common.archived-on', {
                    date: formatDatetime(talk.archivedAt, { format: 'short', locale }),
                    interpolation: { escapeValue: false },
                  })}`}
                </Subtitle>
              ) : null
            }
          </ClientOnly>
        </div>
      </div>

      <dl className="flex flex-col gap-8 p-6 pt-2">
        <div>
          <dt className="sr-only">{t('talk.abstract')}</dt>
          <Markdown as="dd" className="text-gray-700">
            {talk.abstract}
          </Markdown>
        </div>

        {showFormats && talk.formats && talk.formats?.length > 0 && (
          <div>
            <dt className="text-sm leading-6 font-medium text-gray-900">{t('common.formats')}</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {talk.formats?.map(({ id, name }) => (
                <p key={id}>{name}</p>
              ))}
            </dd>
          </div>
        )}

        {showCategories && talk.categories && talk.categories?.length > 0 && (
          <div>
            <dt className="text-sm leading-6 font-medium text-gray-900">{t('common.categories')}</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {talk.categories?.map(({ id, name }) => (
                <p key={id}>{name}</p>
              ))}
            </dd>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {talk.level && <Badge color="indigo">{t(`common.level.${talk.level}`)}</Badge>}
          {talk.languages.map((lang) => (
            <Badge key={lang}>{`${t(`common.languages.${lang}.flag`)} ${t(`common.languages.${lang}.label`)}`}</Badge>
          ))}
        </div>
      </dl>

      {talk.references ? (
        <Card.Disclosure title={t('talk.references')} defaultOpen={referencesOpen}>
          <Markdown>{talk.references}</Markdown>
        </Card.Disclosure>
      ) : null}

      {children}
    </Card>
  );
}
