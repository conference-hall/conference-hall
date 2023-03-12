import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { OrganizerProposalContext } from './organizer.$slug.$eventSlug.review.$proposal';
import { sessionRequired } from '~/libs/auth/auth.server';
import { Form, useActionData, useOutletContext, useSearchParams } from '@remix-run/react';
import { TalkAbstractForm } from '~/components/TalkAbstractForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { FormatsForm } from '~/components/FormatsForm';
import { CategoriesForm } from '~/components/CategoriesForm';
import { mapErrorToResponse } from '~/libs/errors';
import { withZod } from '@remix-validated-form/with-zod';
import { ProposalUpdateSchema } from '~/schemas/proposal';
import { updateProposal } from '~/services/organizer-review/update-proposal.server';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request, params }: ActionArgs) => {
  const { uid } = await sessionRequired(request);
  try {
    const { slug, eventSlug, proposal } = params;
    const form = await request.formData();
    const result = await withZod(ProposalUpdateSchema).validate(form);
    if (result.error) return json(result.error.fieldErrors);
    await updateProposal(slug!, eventSlug!, params.proposal!, uid, result.data);
    const url = new URL(request.url);
    throw redirect(`/organizer/${slug}/${eventSlug}/review/${proposal}${url.search}`);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
};

export default function OrganizerProposalContentRoute() {
  const { event, proposalReview } = useOutletContext<OrganizerProposalContext>();
  const [searchParams] = useSearchParams();
  const errors = useActionData<typeof action>();

  const formatsIds = proposalReview.proposal.formats.map(({ id }) => id);
  const categoriesIds = proposalReview.proposal.categories.map(({ id }) => id);

  return (
    <Form method="post" className="flex h-full flex-1 flex-col justify-between overflow-hidden">
      <div className="flex flex-col gap-8 overflow-auto py-8 sm:px-8">
        <TalkAbstractForm initialValues={proposalReview.proposal} errors={errors} />
        {event.formats.length > 0 && <FormatsForm formats={event.formats} initialValues={formatsIds} />}
        {event.categories.length > 0 && <CategoriesForm categories={event.categories} initialValues={categoriesIds} />}
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 bg-white p-6">
        <ButtonLink to={{ pathname: '..', search: searchParams.toString() }} variant="secondary">
          Cancel
        </ButtonLink>
        <Button type="submit">Save proposal</Button>
      </div>
    </Form>
  );
}
