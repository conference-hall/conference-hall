import type { ChangeEvent } from 'react';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Form, useActionData, useOutletContext, useSubmit } from '@remix-run/react';
import { AlertInfo } from '~/design-system/Alerts';
import { ExternalLink } from '~/design-system/Links';
import type { OrganizerEventContext } from '../../$eventSlug';
import { UploadingError } from '~/services/utils/storage.server';
import { ButtonFileUpload } from '~/design-system/forms/FileUploadButton';
import { uploadAndSaveEventBanner } from '~/services/organizers/event.server';
import { mapErrorToResponse } from '~/services/errors';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const uid = await sessionRequired(request);
  try {
    const { slug, eventSlug } = params;
    await uploadAndSaveEventBanner(slug!, eventSlug!, uid, request);
    return json(null);
  } catch (error) {
    if (error instanceof UploadingError) {
      return json({ error: error.message });
    }
    throw mapErrorToResponse(error);
  }
};

export default function EventGeneralSettingsRoute() {
  const { event } = useOutletContext<OrganizerEventContext>();
  const submit = useSubmit();
  const result = useActionData<typeof action>();

  const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
    if (e.currentTarget[0] && (e.currentTarget[0] as HTMLInputElement).value) {
      submit(e.currentTarget);
    }
  };

  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-4">Customize event banner</H2>
        <div className="mt-6 space-y-4">
          <Text variant="secondary" className="mt-4">
            Upload your event banner to give a fancy style to your event page.
          </Text>
          <AlertInfo>
            JPEG format with optimal resolution of 1500x500.
            <br />
            100kB max (optimize it with <ExternalLink href="https://squoosh.app">squoosh.app</ExternalLink>)
          </AlertInfo>
          {event.bannerUrl && (
            <img
              src={`${event.bannerUrl}?${Math.random()}`}
              alt="Event banner"
              className="h-64 w-full rounded object-cover"
            />
          )}
          <div className="space-x-4">
            <Form method="post" encType="multipart/form-data" onChange={handleSubmit}>
              <ButtonFileUpload name="bannerUrl" accept="image/jpeg" error={result?.error}>
                Change banner
              </ButtonFileUpload>
            </Form>
          </div>
        </div>
      </section>
    </>
  );
}
