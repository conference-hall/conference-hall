import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { getSocialIcon } from '~/design-system/social-link.tsx';
import { Label } from '~/design-system/typography.tsx';
import { extractSocialProfile } from '~/shared/formatters/social-links.ts';

const MAX_SOCIAL_LINKS = 4;

type SpeakerFormProps = {
  id?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  errors?: Record<string, string[] | null> | null;
  defaultValues?: {
    name?: string;
    email?: string;
    picture?: string;
    company?: string;
    location?: string;
    bio?: string;
    references?: string;
    socialLinks?: Array<string>;
  };
  className?: string;
};

export function SpeakerForm({ id, method = 'POST', errors, defaultValues = {}, className }: SpeakerFormProps) {
  const { t } = useTranslation();
  const generatedId = useId();
  const formId = id || generatedId;

  const {
    name = '',
    email = '',
    picture = '',
    company = '',
    location = '',
    bio = '',
    references = '',
    socialLinks = [],
  } = defaultValues;

  return (
    <Form method={method} id={formId} className={className} preventScrollReset>
      <div className="space-y-6">
        <Input
          name="email"
          type="email"
          label={t('common.email')}
          defaultValue={email}
          error={errors?.email}
          required
        />

        <Input name="name" label={t('common.full-name')} defaultValue={name} error={errors?.name} required />

        <div className="flex justify-between gap-8">
          <Input
            name="picture"
            label={t('speaker.profile.picture-url')}
            defaultValue={picture}
            key={picture}
            error={errors?.picture}
            className="flex-1"
          />
          <Avatar picture={picture || null} name={name} size="xl" square />
        </div>

        <Input name="company" label={t('speaker.profile.company')} defaultValue={company} error={errors?.company} />

        <Input name="location" label={t('speaker.profile.location')} defaultValue={location} error={errors?.location} />

        <MarkdownTextArea
          name="bio"
          label={t('speaker.profile.biography')}
          rows={5}
          error={errors?.bio}
          defaultValue={bio}
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
          defaultValue={references}
        />
      </div>
    </Form>
  );
}
