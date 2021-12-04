import { ActionFunction, Form, LoaderFunction, redirect, useLoaderData } from 'remix';
import { Button, ButtonLink } from '~/components/ui/Buttons';
import { requireUserSession, getAuthUserId } from '~/server/auth/auth.server';
import { db } from '../../../server/db';
import { TalkForm } from '../../../components/event-submission/TalkForm';

export const handle = { step: 'proposal' };

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserSession(request);
  const event = await db.event.findUnique({
    select: { formats: true, categories: true },
    where: { slug: params.eventSlug },
  });
  return {
    formats: event?.formats ?? [],
    categories: event?.categories ?? [],
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const uid = await getAuthUserId(request);
  if (!uid) return redirect('/', 401);
  const form = await request.formData();

  await db.talk.create({
    data: {
      title: form.get('title')?.toString() || 'default title',
      abstract: form.get('abstract')?.toString() || 'default desc',
      references: form.get('references')?.toString(),
      creator: { connect: { id: uid } },
      speakers: { connect: [{ id: uid }] },
    },
  });
  return redirect(`/${params.eventSlug}/submit`);
};

export default function EventSubmitTalkRoute() {
  const data = useLoaderData();

  return (
    <Form method="post">
      <TalkForm formats={data.formats} categories={data.categories} />

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
