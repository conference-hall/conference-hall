import { parseWithZod } from '@conform-to/zod';
import { useTranslation } from 'react-i18next';
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
import { i18n } from '~/libs/i18n/i18n.server.ts';
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
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);

  const form = await request.formData();
  const result = parseWithZod(form, { schema: ProfileSchema });
  if (result.status !== 'success') return result.error;

  await SpeakerProfile.for(userId).save(result.value);
  return toast('success', t('settings.profile.feebacks.updated'));
};

export default function ProfileRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { name, picture, bio, company, location, references, socialLinks } = useSpeakerProfile();

  return (
    <div className="space-y-4 lg:space-y-6 ">
      <H1 srOnly>{t('settings.profile.heading')}</H1>

      <Card as="section">
        <Card.Title>
          <H2 id="speaker-profile">{t('settings.profile.speaker-profile')}</H2>
          <Subtitle>{t('settings.profile.speaker-profile.description')}</Subtitle>
        </Card.Title>

        <Card.Content>
          <Form
            method="POST"
            id="speaker-profile-form"
            aria-labelledby="speaker-profile"
            className="space-y-6"
            preventScrollReset
          >
            <Input name="name" label={t('common.full-name')} defaultValue={name || ''} error={errors?.name} />
            <div className="flex justify-between gap-8">
              <Input
                name="picture"
                label={t('speaker.profile.picture-url')}
                defaultValue={picture || ''}
                key={picture}
                error={errors?.picture}
                className="flex-1"
              />
              <Avatar picture={picture} name={name} size="xl" square />
            </div>
            <Input
              name="company"
              label={t('speaker.profile.company')}
              defaultValue={company || ''}
              error={errors?.company}
            />
            <Input
              name="location"
              label={t('speaker.profile.location')}
              defaultValue={location || ''}
              error={errors?.location}
            />
            <MarkdownTextArea
              name="bio"
              label={t('speaker.profile.biography')}
              rows={5}
              error={errors?.bio}
              defaultValue={bio || ''}
            />
            <div className="flex flex-col gap-2">
              <Label>{t('speaker.profile.social-links')}</Label>
              {Array(MAX_SOCIAL_LINKS)
                .fill('')
                .map((_, index) => {
                  const { name, url } = extractSocialProfile(socialLinks[index]);
                  return (
                    <Input
                      key={`${index}:${url}`}
                      name={`socialLinks[${index}]`}
                      aria-label={t('speaker.profile.social-links.label', { index: index + 1 })}
                      placeholder={t('speaker.profile.social-links.placeholder')}
                      defaultValue={url || ''}
                      icon={getSocialIcon(name)}
                      error={errors?.[`socialLinks[${index}]`]}
                    />
                  );
                })}
            </div>
            <MarkdownTextArea
              name="references"
              label={t('speaker.profile.references')}
              description={t('speaker.profile.references.placeholder')}
              rows={5}
              error={errors?.references}
              defaultValue={references || ''}
            />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="speaker-profile" form="speaker-profile-form">
            {t('speaker.profile.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </div>
  );
}
