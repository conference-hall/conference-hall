import { parseWithZod } from '@conform-to/zod';
import { Form } from 'react-router';
import { SpeakerProfile } from '~/.server/speaker-profile/speaker-profile.ts';
import { ProfileSchema } from '~/.server/speaker-profile/speaker-profile.types.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { getSocialIcon } from '~/design-system/social-link.tsx';
import { H1, H2, Label, Subtitle } from '~/design-system/typography.tsx';
import { requireUserSession } from '~/libs/auth/session.ts';
import { extractSocialProfile } from '~/libs/formatters/social-links.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { useSpeakerProfile } from '~/routes/components/contexts/speaker-profile-context.tsx';
import type { Route } from './+types/profile.route.ts';

const MAX_SOCIAL_LINKS = 4;

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Profile | Conference Hall' }]);
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { userId } = await requireUserSession(request);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: ProfileSchema });
  if (result.status !== 'success') return result.error;

  await SpeakerProfile.for(userId).save(result.value);
  return toast('success', 'Profile updated.');
};

export default function ProfileRoute({ actionData: errors }: Route.ComponentProps) {
  const { name, picture, bio, company, location, references, socialLinks } = useSpeakerProfile();

  return (
    <div className="space-y-4 lg:space-y-6 ">
      <H1 srOnly>Profile</H1>

      <Card as="section">
        <Card.Title>
          <H2 id="speaker-profile">Speaker profile</H2>
          <Subtitle>
            Give more information about you, these information will be visible by organizers when you submit a talk.
          </Subtitle>
        </Card.Title>

        <Card.Content>
          <Form
            method="POST"
            id="speaker-profile-form"
            aria-labelledby="speaker-profile"
            className="space-y-6"
            preventScrollReset
          >
            <Input name="name" label="Full name" defaultValue={name || ''} error={errors?.name} />
            <div className="flex justify-between gap-8">
              <Input
                name="picture"
                label="Avatar picture URL"
                defaultValue={picture || ''}
                key={picture}
                error={errors?.picture}
                className="flex-1"
              />
              <Avatar picture={picture} name={name} size="xl" square />
            </div>
            <Input name="company" label="Company" defaultValue={company || ''} error={errors?.company} />
            <Input
              name="location"
              label="Location (city, country)"
              defaultValue={location || ''}
              error={errors?.location}
            />
            <MarkdownTextArea name="bio" label="Biography" rows={5} error={errors?.bio} defaultValue={bio || ''} />
            <div className="flex flex-col gap-2">
              <Label>Social links</Label>
              {Array(MAX_SOCIAL_LINKS)
                .fill('')
                .map((_, index) => {
                  const { name, url } = extractSocialProfile(socialLinks[index]);
                  return (
                    <Input
                      key={`${index}:${url}`}
                      name={`socialLinks[${index}]`}
                      aria-label={`Social link ${index + 1}`}
                      placeholder="Link to social profile"
                      defaultValue={url || ''}
                      icon={getSocialIcon(name)}
                      error={errors?.[`socialLinks[${index}]`]}
                    />
                  );
                })}
            </div>
            <MarkdownTextArea
              name="references"
              label="Speaker references"
              description="Give some information about your speaker experience: your already-given talks, conferences or meetups as speaker, video links..."
              rows={5}
              error={errors?.references}
              defaultValue={references || ''}
            />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="speaker-profile" form="speaker-profile-form">
            Save profile
          </Button>
        </Card.Actions>
      </Card>
    </div>
  );
}
