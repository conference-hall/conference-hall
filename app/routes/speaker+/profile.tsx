import { parseWithZod } from '@conform-to/zod';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData, useLoaderData } from '@remix-run/react';

import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import {
  AdditionalInfoSchema,
  DetailsSchema,
  PersonalInfoSchema,
} from '~/.server/speaker-profile/speaker-profile.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';

import { AdditionalInfoForm } from './__components/additional-info-form.tsx';
import { PersonalInfoForm } from './__components/personal-info-form.tsx';
import { SpeakerDetailsForm } from './__components/speaker-details-form.tsx';

export const meta = mergeMeta(() => [{ title: 'My profile | Conference Hall' }]);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  const profile = await SpeakerProfile.for(userId).get();
  return json(profile);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;
  const profile = SpeakerProfile.for(userId);

  switch (intent) {
    case 'personal-info': {
      const result = parseWithZod(form, { schema: PersonalInfoSchema });
      if (result.status !== 'success') return json(result.error);
      await profile.save(result.value);
      break;
    }
    case 'speaker-details': {
      const result = parseWithZod(form, { schema: DetailsSchema });
      if (result.status !== 'success') return json(result.error);
      await profile.save(result.value);
      break;
    }
    case 'additional-info': {
      const result = parseWithZod(form, { schema: AdditionalInfoSchema });
      if (result.status !== 'success') return json(result.error);
      await profile.save(result.value);
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
  const profile = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <h1 className="sr-only">My profile</h1>

      <NavSideMenu
        aria-label="Profile edition menu"
        items={MENU_ITEMS}
        className="w-full mb-6 lg:col-span-3 lg:sticky lg:top-4"
        noActive
      />

      <div className="space-y-4 lg:space-y-6 lg:col-span-9">
        <PersonalInfoForm name={profile.name} email={profile.email} picture={profile.picture} errors={errors} />

        <SpeakerDetailsForm bio={profile.bio} references={profile.references} errors={errors} />

        <AdditionalInfoForm
          company={profile.company}
          location={profile.location}
          socials={profile.socials}
          errors={errors}
        />
      </div>
    </Page>
  );
}
