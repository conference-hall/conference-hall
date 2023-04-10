import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useActionData, useOutletContext } from '@remix-run/react';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { Container } from '../../design-system/Container';
import { mapErrorToResponse } from '../../libs/errors';
import { sessionRequired } from '../../libs/auth/auth.server';
import { NavMenu } from '~/design-system/NavMenu';
import { withZod } from '@remix-validated-form/with-zod';
import type { SpeakerContext } from '../speaker/route';
import { saveProfile } from '~/shared-server/profile/save-profile.server';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from '~/schemas/profile.schema';
import { Header } from '~/shared-components/Header';
import { Card } from '~/design-system/Card';
import { createToast } from '~/libs/toasts/toasts';
import { AdditionalInfoForm } from './components/AdditionalInfoForm';
import { PersonalInfoForm } from './components/PersonalInfoForm';
import { SpeakerDetailsForm } from './components/SpeakerDetailsForm';

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
      <Header title="Your profile" subtitle="Share your biography and references to event organizers." />

      <Container className="mt-4 h-full sm:mt-8 lg:grid lg:grid-cols-12 lg:gap-x-5">
        <NavMenu items={MENU_ITEMS} className="hidden lg:col-span-3 lg:block" noActive />

        <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
          <Card as="section" rounded="lg">
            <SpeakerDetailsForm name={user.name} email={user.email} photoURL={user.photoURL} errors={errors} />
          </Card>

          <Card as="section" rounded="lg">
            <PersonalInfoForm bio={user.bio} references={user.references} errors={errors} />
          </Card>

          <Card as="section" rounded="lg">
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
