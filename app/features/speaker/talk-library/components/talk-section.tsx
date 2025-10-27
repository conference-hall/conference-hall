import { cx } from 'class-variance-authority';
import type { TalkLevel } from 'prisma/generated/enums.ts';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/design-system/badges.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { ClientOnly } from '~/design-system/utils/client-only.tsx';
import { formatDatetime } from '~/shared/datetimes/datetimes.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
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
    speakers: Array<SpeakerProps>;
    invitationLink?: string;
    archived?: boolean;
    formats?: Array<{ id: string; name: string }>;
    categories?: Array<{ id: string; name: string }>;
    createdAt: Date;
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
        className={cx('gap-4 p-3 pl-6 border-b border-b-gray-200', {
          'flex flex-col sm:flex-row justify-between sm:items-center': Boolean(actions),
          'flex justify-between items-center': Boolean(action),
        })}
      >
        <H1 size="base">{talk.title}</H1>

        {action ? (
          action
        ) : actions ? (
          <div className="flex flex-row sm:justify-between items-center gap-3">{actions}</div>
        ) : null}
      </div>

      <div className="py-4 px-6 flex gap-4">
        {showSpeakers ? (
          <Speakers
            speakers={talk.speakers}
            invitationLink={talk.invitationLink}
            canEdit={canEditSpeakers && !talk.archived}
            className="grow"
          />
        ) : null}

        <Text size="xs" variant="secondary" className="text-nowrap pl-1.5 hidden sm:block">
          <ClientOnly>
            {() =>
              t('common.created-on', {
                date: formatDatetime(talk.createdAt, { format: 'medium', locale }),
                interpolation: { escapeValue: false },
              })
            }
          </ClientOnly>
        </Text>
      </div>

      <dl className="p-6 pt-2 flex flex-col gap-8">
        <div>
          <dt className="sr-only">{t('talk.abstract')}</dt>
          <Markdown as="dd" className="text-gray-700">
            {talk.abstract}
          </Markdown>
        </div>

        {showFormats && talk.formats && talk.formats?.length > 0 && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">{t('common.formats')}</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {talk.formats?.map(({ id, name }) => (
                <p key={id}>{name}</p>
              ))}
            </dd>
          </div>
        )}

        {showCategories && talk.categories && talk.categories?.length > 0 && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">{t('common.categories')}</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {talk.categories?.map(({ id, name }) => (
                <p key={id}>{name}</p>
              ))}
            </dd>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
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
