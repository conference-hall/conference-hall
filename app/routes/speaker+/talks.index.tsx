import { PlusIcon } from '@heroicons/react/20/solid';
import { InboxIcon } from '@heroicons/react/24/outline';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import Select from '~/design-system/forms/Select.tsx';
import { EmptyState } from '~/design-system/layouts/EmptyState.tsx';
import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { TalksLibrary } from '~/domains/talk-library/TalksLibrary.ts';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';

import { ProposalCard } from '../__components/proposals/ProposalCard.tsx';

export const meta = mergeMeta(() => [{ title: 'Talks library | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const { searchParams } = new URL(request.url);
  const archived = Boolean(searchParams.get('archived'));
  const talks = await TalksLibrary.of(userId).list({ archived });
  return json(talks);
};

export default function SpeakerTalksRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const archived = Boolean(searchParams.get('archived'));
  const talks = useLoaderData<typeof loader>();

  const handleStatus = (name: string, value: string) => {
    const path = value === 'archived' ? '?archived=true' : '';
    navigate(`/speaker/talks${path}`);
  };

  return (
    <>
      <PageHeaderTitle title="Your talks library" subtitle="This is your talks library.">
        <Select
          name="status"
          label="Talk status"
          value={archived ? 'archived' : 'active'}
          onChange={handleStatus}
          className="sm:w-40"
          srOnly
          options={[
            { id: 'active', label: 'Active talks' },
            { id: 'archived', label: 'Archived talks' },
          ]}
        />
        <ButtonLink iconLeft={PlusIcon} to="/speaker/talks/new">
          New talk
        </ButtonLink>
      </PageHeaderTitle>

      <PageContent>
        {talks.length === 0 ? (
          <EmptyState icon={InboxIcon} label="No talks found." />
        ) : (
          <ul aria-label="Talks list" className="grid grid-cols-1 gap-4 lg:gap-6 sm:grid-cols-2">
            {talks.map((talk) => (
              <ProposalCard key={talk.id} id={talk.id} title={talk.title} speakers={talk.speakers} />
            ))}
          </ul>
        )}
      </PageContent>
    </>
  );
}
