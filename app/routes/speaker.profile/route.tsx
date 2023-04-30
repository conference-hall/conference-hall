import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { withZod } from '@remix-validated-form/with-zod';
import {
  saveUserAdditionalInfo,
  saveUserDetails,
  saveUserPersonalInfo,
} from '~/shared-server/profile/save-profile.server';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from '~/schemas/profile.schema';
import { addToast } from '~/libs/toasts/toasts';
import { AdditionalInfoForm } from './components/AdditionalInfoForm';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { SpeakerDetailsForm } from './components/SpeakerDetailsForm';
import { getSessionToken, requireSession } from '~/libs/auth/session';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Container } from '~/design-system/layouts/Container';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu';
import { useUser } from '~/root';

export const loader = async ({ request }: LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const type = form.get('_type') as string;
  let result;

  switch (type) {
    case 'INFO': {
      result = await withZod(PersonalInfoSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await saveUserPersonalInfo(userId, result.data);
      break;
    }
    case 'RESET_AUTH_DEFAULT': {
      const authToken = await getSessionToken(request);
      result = await withZod(PersonalInfoSchema).validate(authToken);
      if (result.error) return json(result.error.fieldErrors);
      await saveUserPersonalInfo(userId, result.data);
      break;
    }
    case 'DETAILS': {
      result = await withZod(DetailsSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await saveUserDetails(userId, result.data);
      break;
    }
    case 'ADDITIONAL': {
      result = await withZod(AdditionalInfoSchema).validate(form);
      if (result.error) return json(result.error.fieldErrors);
      await saveUserAdditionalInfo(userId, result.data);
      break;
    }
  }

  return redirect('/speaker/profile', await addToast(request, 'Profile successfully saved.'));
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
          <SpeakerDetailsForm name={user.name} email={user.email} picture={user.picture} errors={errors} />

          <PersonalInfoForm bio={user.bio} references={user.references} errors={errors} />

          <AdditionalInfoForm company={user.company} address={user.address} socials={user.socials} errors={errors} />
        </div>
      </Container>
    </>
  );
}
