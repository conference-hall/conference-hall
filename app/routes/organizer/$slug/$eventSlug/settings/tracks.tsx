import type { LoaderArgs } from '@remix-run/node';
import { sessionRequired } from '~/services/auth/auth.server';
import { H2, Text } from '~/design-system/Typography';
import { Button } from '~/design-system/Buttons';
import { PlusIcon } from '@heroicons/react/20/solid';
import { Checkbox } from '~/design-system/forms/Checkboxes';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export default function EventTracksSettingsRoute() {
  return (
    <>
      <section>
        <div className="flex items-end justify-between border-b border-gray-200 pb-3">
          <H2>Formats</H2>
          <Button variant="secondary" iconLeft={PlusIcon} size="s">
            New format
          </Button>
        </div>
        <Checkbox id="formatsRequired" name="formatsRequired" className="mt-6">
          Make formats required when a speaker submit a proposal
        </Checkbox>
        <Text className="mt-6"> No formats defined yet.</Text>
      </section>
      <section>
        <div className="flex items-end justify-between border-b border-gray-200 pb-3">
          <H2>Categories</H2>
          <Button variant="secondary" iconLeft={PlusIcon} size="s">
            New category
          </Button>
        </div>
        <Checkbox id="categoriesRequired" name="categoriesRequired" className="mt-6">
          Make formats required when a speaker submit a proposal
        </Checkbox>
        <Text className="mt-6"> No categories defined yet.</Text>
      </section>
    </>
  );
}
