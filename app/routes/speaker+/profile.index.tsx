import { parseWithZod } from '@conform-to/zod';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import {
  AdditionalInfoSchema,
  DetailsSchema,
  PersonalInfoSchema,
} from '~/.server/speaker-profile/speaker-profile.types.ts';
import { H1 } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useSpeakerProfile } from '../components/contexts/speaker-profile-context.tsx';
import type { Route } from './+types/profile.index.ts';
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

export default function ProfileRoute({ actionData: errors }: Route.ComponentProps) {
  const profile = useSpeakerProfile();

  return (
    <div className="space-y-4 lg:space-y-6 ">
      <H1 srOnly>My profile</H1>

      <PersonalInfoForm name={profile.name} email={profile.email} picture={profile.picture} errors={errors} />

      <SpeakerDetailsForm bio={profile.bio} references={profile.references} errors={errors} />

      <AdditionalInfoForm
        company={profile.company}
        location={profile.location}
        socialLinks={profile.socialLinks}
        errors={errors}
      />
    </div>
  );
}
