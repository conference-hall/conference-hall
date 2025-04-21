import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import type { TalkLevel } from '@prisma/client';
import { cx } from 'class-variance-authority';
import { format } from 'date-fns';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/design-system/badges.tsx';
import { IconLink } from '~/design-system/icon-buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { H1, Text } from '~/design-system/typography.tsx';
import { getLanguage } from '~/libs/formatters/languages.ts';
import type { SubmissionErrors } from '~/types/errors.types.ts';
import { ClientOnly } from '../utils/client-only.tsx';
import type { SpeakerProps } from './co-speaker.tsx';
import { CoSpeakers } from './co-speaker.tsx';
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
    languages: Array<string>;
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
  const { t } = useTranslation();

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
        <CoSpeakers
          speakers={talk.speakers}
          invitationLink={talk.invitationLink}
          canEdit={canEditSpeakers && !talk.archived}
          className="grow"
        />
        <Text size="xs" variant="secondary" className="text-nowrap hidden sm:block">
          {/* todo(18n) */}
          <ClientOnly>{() => format(talk.createdAt, "'Created on' MMM d, y")}</ClientOnly>
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
            <dt className="text-sm font-medium leading-6 text-gray-900">{t('tracks.formats')}</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {talk.formats?.map(({ id, name }) => (
                <p key={id}>{name}</p>
              ))}
            </dd>
          </div>
        )}

        {showCategories && talk.categories && talk.categories?.length > 0 && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">{t('tracks.categories')}</dt>
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
            <Badge key={language}>{getLanguage(language)}</Badge>
          ))}
        </div>
      </dl>

      {talk.references ? (
        <Disclosure defaultOpen={referencesOpen}>
          <DisclosureButton className="px-6 py-4 group flex items-center gap-2 text-sm font-medium leading-6 text-gray-900 cursor-pointer hover:underline border-t border-t-gray-200">
            <span>{t('talk.references')}</span>
            <ChevronDownIcon className="h-4 w-4 group-data-open:rotate-180" />
          </DisclosureButton>
          <DisclosurePanel as="dd" className="px-6 pb-4">
            <Markdown className="text-gray-700">{talk.references}</Markdown>
          </DisclosurePanel>
        </Disclosure>
      ) : null}

      {children}
    </Card>
  );
}
