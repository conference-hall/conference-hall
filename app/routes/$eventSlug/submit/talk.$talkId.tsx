import { Form, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/Buttons';
import { TalkForm } from '../../../features/event-submission/components/TalkForm';
import { loadTalk, TalkFormData } from '../../../features/event-submission/load-talk-form.server';
import { saveProposal } from '../../../features/event-submission/save-proposal.server';

export const handle = { step: 'proposal' };

export const loader = loadTalk;

export const action = saveProposal;

export default function EventSubmitTalkRoute() {
  const data = useLoaderData<TalkFormData>();

  return (
    <Form method="post">
      <TalkForm {...data} />

      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <ButtonLink to=".." variant="secondary">
          Back
        </ButtonLink>
        <Button type="submit" className="ml-4">
          Next
        </Button>
      </div>
    </Form>
  );
}
