import { json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link, Form, useSearchParams, useNavigate } from '@remix-run/react';
import { Container } from '../../../components-ui/Container';
import { H2, Text } from '../../../components-ui/Typography';
import { requireUserSession } from '../../../services/auth/auth.server';
import { ButtonLink } from '../../../components-ui/Buttons';
import { findTalks, SpeakerTalks } from '../../../services/speakers/talks.server';
import { mapErrorToResponse } from '../../../services/errors';
import { SpeakerTalksList } from '../../../components-app/SpeakerTalksList';
import DetailedSelect from '../../../components-ui/forms/DetailedSelect';

export const loader: LoaderFunction = async ({ request }) => {
  const uid = await requireUserSession(request);
  const { searchParams } = new URL(request.url);
  const archived = Boolean(searchParams.get('archived'));
  try {
    const talks = await findTalks(uid, { archived });
    return json<SpeakerTalks>(talks);
  } catch (err) {
    mapErrorToResponse(err);
  }
};

export default function SpeakerTalksRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const archived = Boolean(searchParams.get('archived'));
  const talks = useLoaderData<SpeakerTalks>();

  const handleStatus = (name: string, value: string) => {
    const path = value === 'archived' ? '?archived=true' : '';
    navigate(`/speaker/talks${path}`)
  }

  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H2>Your talks</H2>
          <Text variant="secondary" className="mt-1">
            All your talk abstracts.
          </Text>
        </div>
        <div className="flex flex-shrink-0 gap-4">
          <DetailedSelect
            name="status"
            label="Talk status"
            value={archived ? 'archived' : 'active'}
            onChange={handleStatus}
            options={[
              { id: 'active', label: 'Active talks' },
              { id: 'archived', label: 'Archived talks' },
            ]}
          />
          <ButtonLink to="new">Create a talk abstract</ButtonLink>
        </div>
      </div>
      <div className="mt-8">
        <SpeakerTalksList talks={talks} />
      </div>
    </Container>
  );
}
