import type { LoaderArgs } from '@remix-run/node';
import type { OrganizerProposalContext } from '../$proposal';
import { sessionRequired } from '~/services/auth/auth.server';
import { Form, useOutletContext, useParams, useSearchParams } from '@remix-run/react';
import { TalkAbstractForm } from '~/components/TalkAbstractForm';
import { Button, ButtonLink } from '~/design-system/Buttons';
import { FormatsForm } from '~/components/FormatsForm';
import { CategoriesForm } from '~/components/CategoriesForm';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function OrganizerProposalContentRoute() {
  const { event, proposalReview } = useOutletContext<OrganizerProposalContext>();
  const { slug, eventSlug, proposal } = useParams();
  const [searchParams] = useSearchParams();

  const formatsIds = proposalReview.proposal.formats.map(({ id }) => id);
  const categoriesIds = proposalReview.proposal.categories.map(({ id }) => id);

  return (
    <Form method="post" className="flex h-full flex-1 flex-col justify-between overflow-hidden">
      <div className="flex flex-col gap-8 overflow-auto py-8 sm:px-8">
        <TalkAbstractForm initialValues={proposalReview.proposal} />
        {event.formats.length > 0 && <FormatsForm formats={event.formats} initialValues={formatsIds} />}
        {event.categories.length > 0 && <CategoriesForm categories={event.categories} initialValues={categoriesIds} />}
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 bg-white p-6">
        <ButtonLink
          to={{
            pathname: `/organizer/${slug}/${eventSlug}/proposals/${proposal}`,
            search: searchParams.toString(),
          }}
          variant="secondary"
        >
          Cancel
        </ButtonLink>
        <Button type="submit">Save proposal</Button>
      </div>
    </Form>
  );
}
