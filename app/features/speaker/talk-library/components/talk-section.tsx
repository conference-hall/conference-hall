import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import type { TalkLevel } from '@prisma/client';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDatetime } from '~/shared/datetimes/datetimes.ts';
import { Badge } from '~/shared/design-system/badges.tsx';
import { IconLink } from '~/shared/design-system/icon-buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { Markdown } from '~/shared/design-system/markdown.tsx';
import { H1, Text } from '~/shared/design-system/typography.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
import type { Languages } from '~/shared/types/proposals.types.ts';
import { ClientOnly } from '../../../../shared/design-system/utils/client-only.tsx';
import type { SpeakerProps } from './speakers.tsx';
import { Speakers } from './speakers.tsx';
import { TalkArchiveButton } from './talk-forms/talk-archive-button.tsx';
import { TalkEditButton } from './talk-forms/talk-form-drawer.tsx';
import { TalkSubmitButton } from './talk-forms/talk-submit-button.tsx';

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
  event?: {
    formats?: Array<{ id: string; name: string; description: string | null }>;
    formatsRequired?: boolean;
    formatsAllowMultiple?: boolean;
    categories?: Array<{ id: string; name: string; description: string | null }>;
    categoriesRequired?: boolean;
    categoriesAllowMultiple?: boolean;
  };
  errors?: SubmissionErrors;
  canEditTalk: boolean;
  canEditSpeakers: boolean;
  canArchive: boolean;
  canSubmitTalk?: boolean;
  showBackButton?: boolean;
  showFormats?: boolean;
  showCategories?: boolean;
  referencesOpen?: boolean;
  children?: ReactNode;
};

export function TalkSection({
  talk,
  event,
  errors,
  children,
  canEditTalk,
  canEditSpeakers,
  canArchive,
  canSubmitTalk = false,
  showBackButton = false,
  showFormats = false,
  showCategories = false,
  referencesOpen = false,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <Card as="section">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pl-6 pr-3 py-3 border-b border-b-gray-200">
        <div className={cx('flex items-center gap-2 min-w-0', { '-ml-2': showBackButton })}>
          {showBackButton ? (
            <IconLink icon={ChevronLeftIcon} label={t('common.go-back')} to=".." variant="secondary" relative="path" />
          ) : null}
          <H1 size="base">{talk.title}</H1>
        </div>
        <div className="flex flex-row sm:justify-between items-center gap-3">
          {canArchive && <TalkArchiveButton archived={Boolean(talk.archived)} />}

          {canEditTalk && !talk.archived && <TalkEditButton initialValues={talk} event={event} errors={errors} />}

          {canSubmitTalk && <TalkSubmitButton talkId={talk.id} />}
        </div>
      </div>

      <div className="p-4 flex gap-4">
        <Speakers
          speakers={talk.speakers}
          invitationLink={talk.invitationLink}
          canEdit={canEditSpeakers && !talk.archived}
          className="grow"
        />
        <Text size="xs" variant="secondary" className="text-nowrap hidden sm:block">
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

      <dl className="p-6 pt-4 flex flex-col gap-8">
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
          {talk.languages.map((language) => (
            <Badge key={language}>{t(`common.languages.${language}.label`)}</Badge>
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
