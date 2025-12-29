import { parseWithZod } from '@conform-to/zod/v4';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { mergeMeta } from '~/app-platform/seo/utils/merge-meta.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { getSocialIcon } from '~/design-system/social-link.tsx';
import { H1, H2, Label, Subtitle } from '~/design-system/typography.tsx';
import { SpeakerProfile } from '~/features/speaker/settings/services/speaker-profile.server.ts';
import { useSpeakerProfile } from '~/features/speaker/speaker-profile-context.tsx';
import { RequireAuthContext } from '~/shared/authentication/auth.middleware.ts';
import { extractSocialProfile } from '~/shared/formatters/social-links.ts';
import { getI18n } from '~/shared/i18n/i18n.middleware.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import { ProfileSchema } from '~/shared/types/speaker.types.ts';
import type { Route } from './+types/settings.profile.ts';

const MAX_SOCIAL_LINKS = 4;

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Profile | Conference Hall' }]);
};

export const action = async ({ request, context }: Route.ActionArgs) => {
  const authUser = context.get(RequireAuthContext);
  const i18n = getI18n(context);
  const form = await request.formData();
  const result = parseWithZod(form, { schema: ProfileSchema });
  if (result.status !== 'success') return result.error;

  await SpeakerProfile.for(authUser.id).save(result.value);
  return toast('success', i18n.t('settings.profile.feebacks.updated'));
};

export default function ProfileRoute({ actionData: errors }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formId = useId();
  const { name, picture, bio, company, location, references, socialLinks } = useSpeakerProfile();

  return (
    <div className="space-y-4 lg:space-y-6">
      <H1 srOnly>{t('settings.profile.heading')}</H1>

      <Card as="section">
        <Card.Title>
          <H2>{t('settings.profile.speaker-profile')}</H2>
          <Subtitle>{t('settings.profile.speaker-profile.description')}</Subtitle>
        </Card.Title>

        <Card.Content>
          <Form method="POST" id={formId} aria-labelledby="speaker-profile" className="space-y-6" preventScrollReset>
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
              className="field-sizing-content min-h-32"
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
              rows={2}
              className="field-sizing-content min-h-16"
              error={errors?.references}
              defaultValue={references || ''}
            />
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="speaker-profile" form={formId}>
            {t('speaker.profile.submit')}
          </Button>
        </Card.Actions>
      </Card>
    </div>
  );
}
