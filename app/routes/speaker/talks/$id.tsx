import { Form, useActionData, useCatch, useLoaderData } from '@remix-run/react';
import { Container } from '~/components/layout/Container';
import { Button } from '../../../components/Buttons';
import { TalkAbstractForm } from '../../../components/proposal/TalkAbstractForm';
import { H2 } from '../../../components/Typography';
import { editSpeakerTalk, loadSpeakerTalk, SpeakerTalk } from '../../../features/speaker-talks/edit-talk.server';
import { ValidationErrors } from '../../../utils/validation-errors';

export const loader = loadSpeakerTalk;

export const action = editSpeakerTalk;

export default function SpeakerTalkRoute() {
  const talk = useLoaderData<SpeakerTalk>();
  const errors = useActionData<ValidationErrors>();

  return (
    <Container className="mt-8">
      <Form method="post" className="mt-8 bg-white border border-gray-200 overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 -ml-4 -mt-4 border-b border-gray-200 flex justify-between items-center flex-wrap sm:flex-nowrap">
          <div className="ml-4 mt-4">
            <H2>{talk.title}</H2>
          </div>
        </div>

        <div className="px-4 py-10 sm:px-6">
          <TalkAbstractForm initialValues={talk} errors={errors?.fieldErrors} />
        </div>

        <div className="px-4 py-5 border-t border-gray-200 text-right sm:px-6">
          <Button type="submit" className="ml-4">
            Save abstract
          </Button>
        </div>
      </Form>
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
