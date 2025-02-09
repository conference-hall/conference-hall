import { parseWithZod } from '@conform-to/zod';
import { CreditCardIcon, KeyIcon, UserCircleIcon } from '@heroicons/react/20/solid';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import {
  AdditionalInfoSchema,
  DetailsSchema,
  PersonalInfoSchema,
} from '~/.server/speaker-profile/speaker-profile.types.ts';
import { Page } from '~/design-system/layouts/page.tsx';
import { NavSideMenu } from '~/design-system/navigation/nav-side-menu.tsx';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useSpeakerProfile } from '../components/contexts/speaker-profile-context.tsx';
import type { Route } from './+types/profile.ts';
import { AdditionalInfoForm } from './components/additional-info-form.tsx';
import { PersonalInfoForm } from './components/personal-info-form.tsx';
import { SpeakerDetailsForm } from './components/speaker-details-form.tsx';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'My profile | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireSession(request);
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const userId = await requireSession(request);
  const form = await request.formData();
  const intent = form.get('intent') as string;
  const profile = SpeakerProfile.for(userId);

  switch (intent) {
    case 'personal-info': {
      const result = parseWithZod(form, { schema: PersonalInfoSchema });
      if (result.status !== 'success') return result.error;
      await profile.save(result.value);
      break;
    }
    case 'speaker-details': {
      const result = parseWithZod(form, { schema: DetailsSchema });
      if (result.status !== 'success') return result.error;
      await profile.save(result.value);
      break;
    }
    case 'additional-info': {
      const result = parseWithZod(form, { schema: AdditionalInfoSchema });
      if (result.status !== 'success') return result.error;
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

export default function ProfileRoute({ actionData: errors }: Route.ComponentProps) {
  const profile = useSpeakerProfile();

  return (
    <Page className="lg:grid lg:grid-cols-12">
      <H1 srOnly>My profile</H1>

      <NavSideMenu
        aria-label="Profile edition menu"
        items={MENU_ITEMS}
        className="hidden sm:block w-full mb-6 lg:col-span-3 lg:sticky lg:top-4 lg:self-start"
        noActive
      />

      <div className="space-y-4 lg:space-y-6 lg:col-span-9">
        <PersonalInfoForm name={profile.name} email={profile.email} picture={profile.picture} errors={errors} />

        <SpeakerDetailsForm bio={profile.bio} references={profile.references} errors={errors} />

        <AdditionalInfoForm
          company={profile.company}
          location={profile.location}
          socialLinks={profile.socialLinks}
          errors={errors}
        />
      </div>
    </Page>
  );
}
