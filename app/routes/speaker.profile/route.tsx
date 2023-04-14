import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useOutletContext } from '@remix-run/react';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { withZod } from '@remix-validated-form/with-zod';
import { saveProfile } from '~/shared-server/profile/save-profile.server';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from '~/schemas/profile.schema';
import { createToast } from '~/libs/toasts/toasts';
import { mapErrorToResponse } from '~/libs/errors';
import { AdditionalInfoForm } from './components/AdditionalInfoForm';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { SpeakerDetailsForm } from './components/SpeakerDetailsForm';
import { sessionRequired } from '~/libs/auth/auth.server';
import type { SpeakerContext } from '../speaker/route';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle';
import { Container } from '~/design-system/layouts/Container';
import { NavMenu } from '~/design-system/navigation/NavMenu';
import { Card } from '~/design-system/layouts/Card';

export const loader = async ({ request }: LoaderArgs) => {
  await sessionRequired(request);
  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const { uid, session } = await sessionRequired(request);
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
    await saveProfile(uid, result.data);

    const toast = await createToast(session, 'Profile successfully saved.');
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
  const { user } = useOutletContext<SpeakerContext>();
  const errors = useActionData<typeof action>();

  return (
    <>
      <PageHeaderTitle title="Your profile" subtitle="Share your biography and references to event organizers." />

      <Container className="mt-4 flex gap-8 sm:mt-8">
        <NavMenu
          aria-label="Profile edition menu"
          items={MENU_ITEMS}
          className="sticky top-4 hidden w-60 self-start lg:block"
          noActive
        />

        <div className="min-w-0 flex-1 space-y-6 sm:px-6 lg:px-0">
          <Card as="section">
            <SpeakerDetailsForm name={user.name} email={user.email} photoURL={user.photoURL} errors={errors} />
          </Card>

          <Card as="section">
            <PersonalInfoForm bio={user.bio} references={user.references} errors={errors} />
          </Card>

          <Card as="section">
            <AdditionalInfoForm
              company={user.company}
              address={user.address}
              twitter={user.twitter}
              github={user.github}
              errors={errors}
            />
          </Card>
        </div>
      </Container>
    </>
  );
}
