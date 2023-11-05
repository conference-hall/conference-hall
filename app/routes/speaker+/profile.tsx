import { parse } from '@conform-to/zod';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';

import { PageContent } from '~/design-system/layouts/PageContent.tsx';
import { PageHeaderTitle } from '~/design-system/layouts/PageHeaderTitle.tsx';
import { NavSideMenu } from '~/design-system/navigation/NavSideMenu.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useUser } from '~/root.tsx';
import {
  saveUserAdditionalInfo,
  saveUserDetails,
  saveUserPersonalInfo,
} from '~/routes/__server/profile/save-profile.server.ts';
import { AdditionalInfoSchema, DetailsSchema, PersonalInfoSchema } from '~/routes/__types/profile.schema.tsx';

import { AdditionalInfoForm } from './__components/AdditionalInfoForm.tsx';
import { PersonalInfoForm } from './__components/PersonalInfoForm.tsx';
import { SpeakerDetailsForm } from './__components/SpeakerDetailsForm.tsx';

export const meta = mergeMeta(() => [{ title: 'Profile | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
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
  return toast('success', 'Profile updated.');
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

      <PageContent className="lg:grid lg:grid-cols-12">
        <NavSideMenu
          aria-label="Profile edition menu"
          items={MENU_ITEMS}
          className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4"
          noActive
        />

        <div className="space-y-4 lg:space-y-6 lg:col-span-9">
          <PersonalInfoForm name={user.name} email={user.email} picture={user.picture} errors={errors} />

          <SpeakerDetailsForm bio={user.bio} references={user.references} errors={errors} />

          <AdditionalInfoForm company={user.company} address={user.address} socials={user.socials} errors={errors} />
        </div>
      </PageContent>
    </>
  );
}
