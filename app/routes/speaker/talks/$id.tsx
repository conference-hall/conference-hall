import { useCatch } from 'remix';
import { Container } from '~/components/layout/Container';
import { H2 } from '../../../components/Typography';

export default function SpeakerTalkRoute() {
  return (
    <Container className="mt-8">
      <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div>
          <H2>Title</H2>
        </div>
      </div>

      <div className="mt-8 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        Description
      </div>
    </Container>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Container className="mt-8 px-8 py-32 text-center">
      <h1 className="text-8xl font-black text-indigo-400">{caught.status}</h1>
      <p className="mt-10 text-4xl font-bold text-gray-600">{caught.data}</p>
    </Container>
  );
}
