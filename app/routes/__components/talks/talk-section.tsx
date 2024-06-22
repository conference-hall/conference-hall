import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import type { TalkLevel } from '@prisma/client';

import { Badge } from '~/design-system/Badges.tsx';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H1 } from '~/design-system/Typography.tsx';
import { getLanguage } from '~/libs/formatters/languages.ts';
import { getLevel } from '~/libs/formatters/levels.ts';

import type { SpeakerProps } from './co-speaker';
import { CoSpeakers } from './co-speaker.tsx';
import { TalkArchiveButton } from './talk-forms/talk-archive-button.tsx';
import { TalkEditButton } from './talk-forms/talk-form-drawer.tsx';

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
  };
  event?: {
    formats?: Array<{ id: string; name: string; description: string | null }>;
    formatsRequired?: boolean;
    categories?: Array<{ id: string; name: string; description: string | null }>;
    categoriesRequired?: boolean;
  };
  errors?: Record<string, string | string[]> | null;
  canEditTalk: boolean;
  canEditSpeakers: boolean;
  canArchive: boolean;
  showFormats?: boolean;
  showCategories?: boolean;
  referencesOpen?: boolean;
};

export function TalkSection({
  talk,
  event,
  errors,
  canEditTalk,
  canEditSpeakers,
  canArchive,
  showFormats = false,
  showCategories = false,
  referencesOpen = false,
}: Props) {
  return (
    <Card as="section">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-3 border-b border-b-gray-200">
        <H1 size="base" weight="semibold" truncate>
          {talk.title}
        </H1>
        <div className="flex justify-between items-center gap-4">
          {canArchive && <TalkArchiveButton archived={Boolean(talk.archived)} />}

          {canEditTalk && !talk.archived && <TalkEditButton initialValues={talk} event={event} errors={errors} />}
        </div>
      </div>

      <CoSpeakers
        speakers={talk.speakers}
        invitationLink={talk.invitationLink}
        canEdit={canEditSpeakers && !talk.archived}
        className="p-4"
      />

      <dl className="p-6 pt-4 flex flex-col gap-8">
        <div>
          <dt className="sr-only">Abstract</dt>
          <Markdown as="dd" className="text-gray-700">
            {talk.abstract}
          </Markdown>
        </div>

        {showFormats && talk.formats && talk.formats?.length > 0 && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">Formats</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {talk.formats?.map(({ id, name }) => <p key={id}>{name}</p>)}
            </dd>
          </div>
        )}

        {showCategories && talk.categories && talk.categories?.length > 0 && (
          <div>
            <dt className="text-sm font-medium leading-6 text-gray-900">Categories</dt>
            <dd className="text-sm leading-6 text-gray-700">
              {talk.categories?.map(({ id, name }) => <p key={id}>{name}</p>)}
            </dd>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {talk.level && <Badge color="indigo">{getLevel(talk.level)}</Badge>}
          {talk.languages.map((language) => (
            <Badge key={language}>{getLanguage(language)}</Badge>
          ))}
        </div>
      </dl>

      {talk.references && (
        <dl className="px-6 py-4 border-t border-t-gray-200">
          <Disclosure defaultOpen={referencesOpen}>
            <DisclosureButton
              as="dt"
              className="group flex items-center gap-2 text-sm font-medium leading-6 text-gray-900 cursor-pointer"
            >
              <span>Talk references</span>
              <ChevronDownIcon className="h-4 w-4 group-data-[open]:rotate-180" />
            </DisclosureButton>
            <DisclosurePanel>
              <Markdown as="dd" className="text-gray-700 pt-2">
                {talk.references}
              </Markdown>
            </DisclosurePanel>
          </Disclosure>
        </dl>
      )}
    </Card>
  );
}
