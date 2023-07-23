import { parse } from '@conform-to/zod';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';

import { Container } from '~/design-system/layouts/Container';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { requireSession } from '~/libs/auth/session';
import { mergeMeta } from '~/libs/meta/merge-meta';
import { addToast } from '~/libs/toasts/toasts';
import { useUser } from '~/root';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from '~/schemas/profile.schema';
import { saveUserAdditionalInfo, saveUserDetails, saveUserPersonalInfo } from '~/server/profile/save-profile.server';

import { AdditionalInfoForm } from './components/AdditionalInfoForm';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { SpeakerDetailsForm } from './components/SpeakerDetailsForm';

export const meta = mergeMeta(() => [{ title: 'Profile | Conference Hall' }]);

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const type = form.get('intent') as string;

  switch (type) {
    case 'personal-info': {
      const result = parse(form, { schema: PersonalInfoSchema });
      if (!result.value) return json(result.error);
      await saveUserPersonalInfo(userId, result.value);
      break;
    }
    case 'speaker-details': {
      const result = parse(form, { schema: DetailsSchema });
      if (!result.value) return json(result.error);
      await saveUserDetails(userId, result.value);
      break;
    }
    case 'additional-info': {
      const result = parse(form, { schema: AdditionalInfoSchema });
      if (!result.value) return json(result.error);
      await saveUserAdditionalInfo(userId, result.value);
      break;
    }
  }
  return json(null, await addToast(request, 'Profile updated.'));
};

const MENU_ITEMS = [
  { to: '#personal-info', icon: UserCircleIcon, label: 'Personal information' },
  { to: '#speaker-details', icon: KeyIcon, label: 'Speaker details' },
  { to: '#additional-info', icon: CreditCardIcon, label: 'Additional information' },
];

export default function ProfileRoute() {
  const { user } = useUser();
  const errors = useActionData<typeof action>();

  if (!user) return null;

  return (
    <>
      <PageHeaderTitle title="Your profile" subtitle="Share your biography and references to event organizers." />

      <Container className="mt-4 flex gap-8 sm:mt-8">
        <NavSideMenu
          aria-label="Profile edition menu"
          items={MENU_ITEMS}
          className="sticky top-4 hidden self-start lg:block"
          noActive
        />

        <div className="min-w-0 flex-1 space-y-6 sm:px-6 lg:px-0">
          <PersonalInfoForm name={user.name} email={user.email} picture={user.picture} errors={errors} />

          <SpeakerDetailsForm bio={user.bio} references={user.references} errors={errors} />

          <AdditionalInfoForm company={user.company} address={user.address} socials={user.socials} errors={errors} />
        </div>
      </Container>
    </>
  );
}
