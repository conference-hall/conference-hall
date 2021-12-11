import { LoaderFunction, useParams } from 'remix';
import { Container } from '~/components/layout/Container';
import { Heading } from '../../components/Heading';
import { requireUserSession } from '../../features/auth/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserSession(request);
  return null;
};

export default function EventSpeakerProposalRoute() {
  const { id } = useParams()
  return (
    <Container className="mt-8">
      <Heading>Proposal {id}</Heading>
    </Container>
  );
}
