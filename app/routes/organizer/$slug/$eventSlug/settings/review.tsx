import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventReviewSettingsRoute() {
  return (
    <>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Proposals review</H2>
        <Form className="mt-6 space-y-4">
          <Text variant="secondary">
            Enable or disabled proposal review. When disabled, reviewers won't be able to review proposals anymore.
          </Text>
          <Button>Disable proposal review</Button>
        </Form>
      </section>
      <section>
        <H2 className="border-b border-gray-200 pb-3">Review settings</H2>
        <Form className="mt-6 space-y-4">
          <Checkbox
            id="hideOrganizersRatings"
            name="hideOrganizersRatings"
            description="Organizer ratings won't be visible in the review page."
          >
            Hide organizers ratings
          </Checkbox>
          <Checkbox
            id="hideProposalsRatings"
            name="hideProposalsRatings"
            description="Proposal global ratings won't be visibile in the proposals list."
          >
            Hide ratings from proposal list
          </Checkbox>
          <Checkbox
            id="hideProposalsSpeakers"
            name="hideProposalsSpeakers"
            description="Used for anonymized reviews, all speakers information are not visible in proposal list and review page."
          >
            Hide speakers from proposal page
          </Checkbox>
        </Form>
      </section>
    </>
  );
}
