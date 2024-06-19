import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import type { TalkLevel } from '@prisma/client';
import { useSearchParams } from '@remix-run/react';

import { Badge } from '~/design-system/Badges.tsx';
import { ButtonLink } from '~/design-system/Buttons';
import { Card } from '~/design-system/layouts/Card.tsx';
import { Markdown } from '~/design-system/Markdown.tsx';
import { H1 } from '~/design-system/Typography';
import { getLanguage } from '~/libs/formatters/languages';
import { getLevel } from '~/libs/formatters/levels';

import { CoSpeakers } from './co-speaker';
import { TalkArchiveButton } from './talk-archive-button';

type Props = {
  talk: {
    id: string;
    title: string;
    abstract: string;
    references: string | null;
    level: TalkLevel | null;
    languages: Array<string>;
    invitationLink: string;
    archived: boolean;
    speakers: Array<{
      id: string;
      name: string | null;
      picture: string | null;
      bio: string | null;
      isCurrentUser: boolean;
    }>;
  };
  canEdit: boolean;
  canArchive: boolean;
  canSubmit: boolean;
  referencesOpen?: boolean;
};

export function TalkSection({ talk, canEdit, canArchive, canSubmit, referencesOpen = false }: Props) {
  const [search] = useSearchParams();

  return (
    <Card as="section">
      <div className="flex justify-between items-center gap-4 px-6 py-3 border-b border-b-gray-200">
        <H1 size="base" weight="semibold" truncate>
          {talk.title}
        </H1>
        <div className="flex justify-between items-center gap-4">
          {canArchive && <TalkArchiveButton archived={talk.archived} />}
          {canEdit && !talk.archived && (
            <ButtonLink
              iconLeft={PencilSquareIcon}
              variant="secondary"
              to={{ pathname: 'edit', search: search.toString() }}
            >
              Edit
            </ButtonLink>
          )}
          {canSubmit && !talk.archived && (
            <ButtonLink to={{ pathname: '/', search: `?talkId=${talk.id}` }}>Submit to event</ButtonLink>
          )}
        </div>
      </div>

      <CoSpeakers
        speakers={talk.speakers}
        invitationLink={talk.invitationLink}
        canEdit={canEdit && !talk.archived}
        className="p-4"
      />

      <dl className="p-6 pt-4 flex flex-col gap-8">
        <div>
          <dt className="sr-only">Abstract</dt>
          <Markdown as="dd" className="text-gray-700">
            {talk.abstract}
          </Markdown>
        </div>

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
