import { TrashIcon } from '@heroicons/react/solid';
import { json, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Button, ButtonLink } from '~/components/Buttons';
import { MarkdownTextArea } from '../../../../components/forms/MarkdownTextArea';
import { Link } from '../../../../components/Links';
import { H2, Text } from '../../../../components/Typography';
import { requireUserSession } from '../../../../services/auth/auth.server';
import { mapErrorToResponse } from '../../../../services/errors';
import { getTalk, SpeakerTalk } from '../../../../services/speakers/talks.server';
import { AddCoSpeakerButton } from '../../../speaker/components/CoSpeaker';
import { useSubmissionStep } from '../../components/useSubmissionStep';

export const handle = { step: 'speakers' };

export const loader: LoaderFunction = async ({ request, params }) => {
  const uid = await requireUserSession(request);
  const talkId = params.talkId!;
  try {
    const talk = await getTalk(uid, talkId);
    return json<SpeakerTalk>(talk);
  } catch (err) {
    mapErrorToResponse(err);
  }
  return null;
};

export default function SubmissionSpeakerRoute() {
  const talk = useLoaderData<SpeakerTalk>();
  const { previousPath, nextPath } = useSubmissionStep();

  return (
    <>
      <div className="px-8 py-6 sm:py-10">
        <Form method="post">
          <div>
            <H2>Speaker details</H2>
            <Text variant="secondary" className="mt-1">
              Give more information about you, these information will be visible by organizers when you submit a talk.
            </Text>
          </div>
          <MarkdownTextArea
            id="bio"
            name="bio"
            label="Biography"
            description="Brief description for your profile."
            rows={5}
            // error={fieldErrors?.bio?.[0]}
            // defaultValue={user.bio || ''}
            className="mt-6"
          />
          <Text className="mt-2">
            You can give more information about you in <Link to="/speaker/settings">your settings page.</Link>
          </Text>
        </Form>
        <div className="mt-12">
          <H2>Co-speakers</H2>
          <Text variant="secondary" className="mt-1">
            This information will be displayed publicly so be careful what you share.
          </Text>
          <div className="py-4 max-w-md">
            {talk.speakers.map((speaker) => (
              <div key={speaker.id} className="mt-4 flex justify-between items-center">
                <div className="flex items-center">
                  <img
                    className="inline-block h-9 w-9 rounded-full"
                    src={speaker.photoURL || 'http://placekitten.com/100/100'}
                    alt={speaker.name || 'Speaker'}
                  />
                  <div className="ml-3">
                    <Text>{speaker.name}</Text>
                    <Text variant="secondary" size="xs">
                      {speaker.isOwner ? 'Owner' : 'Co-speaker'}
                    </Text>
                  </div>
                </div>
                <div>
                  {!speaker.isOwner && (
                    <Form method="post">
                      <input type="hidden" name="_action" value="remove-speaker" />
                      <input type="hidden" name="_speakerId" value={speaker.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 bg-white hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            ))}
          </div>
          <AddCoSpeakerButton />
        </div>
      </div>
      <div className="px-4 py-5 text-right sm:px-6">
        <ButtonLink to={previousPath} variant="secondary">
          Back
        </ButtonLink>
        <ButtonLink to={nextPath} className="ml-4">
          Next
        </ButtonLink>
      </div>
    </>
  );
}
