import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { withZod } from '@remix-validated-form/with-zod';
import { saveProfile } from '~/shared-server/profile/save-profile.server';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from '~/schemas/profile.schema';
import { createToast } from '~/libs/toasts/toasts';
import { mapErrorToResponse } from '~/libs/errors';
import { AdditionalInfoForm } from './components/AdditionalInfoForm';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { SpeakerDetailsForm } from './components/SpeakerDetailsForm';
import { requireSession } from '~/libs/auth/session';
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
  try {
    let result;

    switch (type) {
      case 'INFO':
        result = await withZod(PersonalInfoSchema).validate(form);
        break;
      case 'DETAILS':
        result = await withZod(DetailsSchema).validate(form);
        break;
      default:
        result = await withZod(AdditionalInfoSchema).validate(form);
    }

    if (result.error) return json(result.error.fieldErrors);
    await saveProfile(userId, result.data);

    const toast = await createToast(request, 'Profile successfully saved.');
    return redirect('/speaker/profile', toast);
  } catch (err) {
    throw mapErrorToResponse(err);
  }
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

          <AdditionalInfoForm
            company={user.company}
            address={user.address}
            twitter={user.twitter}
            github={user.github}
            errors={errors}
          />
        </div>
      </Container>
    </>
  );
}
