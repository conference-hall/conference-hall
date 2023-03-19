import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useSearchParams, useNavigate } from '@remix-run/react';
import { Container } from '../../design-system/Container';
import { H2, Text } from '../../design-system/Typography';
import { sessionRequired } from '../../libs/auth/auth.server';
import { mapErrorToResponse } from '../../libs/errors';
import { SpeakerTalksList } from './components/SpeakerTalksList';
import Select from '~/design-system/forms/Select';
import { listTalks } from './server/list-talks.server';

export const loader = async ({ request }: LoaderArgs) => {
  const { uid } = await sessionRequired(request);
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
    <Container className="my-4 sm:my-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:block">
          <H2>Your talks</H2>
          <Text variant="secondary" className="mt-1">
            All your talk abstracts.
          </Text>
        </div>
        <div className="flex flex-col gap-4 sm:mt-0 sm:flex-row">
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
        </div>
      </div>
      <div className="my-8">
        <SpeakerTalksList talks={talks} />
      </div>
    </Container>
  );
}
