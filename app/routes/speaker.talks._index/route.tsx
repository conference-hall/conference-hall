import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams, useNavigate } from '@remix-run/react';
import { SpeakerTalksList } from './components/SpeakerTalksList';
import Select from '~/design-system/forms/Select';
import { listTalks } from './server/list-talks.server';
import { requireSession } from '~/libs/auth/session';
import { mapErrorToResponse } from '~/libs/errors';
import { ButtonLink } from '~/design-system/Buttons';
import { PlusIcon } from '@heroicons/react/20/solid';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Container } from '~/design-system/layouts/Container';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await requireSession(request);
  const { searchParams } = new URL(request.url);
  const archived = Boolean(searchParams.get('archived'));
  try {
    const talks = await listTalks(uid, { archived });
    return json(talks);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
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
