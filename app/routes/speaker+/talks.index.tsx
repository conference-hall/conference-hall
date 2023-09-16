import { PlusIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate, useSearchParams } from '@remix-run/react';

import { ButtonLink } from '~/design-system/Buttons';
import Select from '~/design-system/forms/Select';
import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';

import { SpeakerTalksList } from './__components/SpeakerTalksList';
import { listTalks } from './__server/list-talks.server';

export const meta = mergeMeta(() => [{ title: 'Talks library | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const { searchParams } = new URL(request.url);
  const archived = Boolean(searchParams.get('archived'));
  const talks = await listTalks(userId, { archived });
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

      <Container className="mt-4 sm:mt-8">
        <SpeakerTalksList talks={talks} />
      </Container>
    </>
  );
}
