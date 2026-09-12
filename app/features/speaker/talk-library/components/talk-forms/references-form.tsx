import { ChevronDownIcon, PaperClipIcon, PresentationChartBarIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputLink } from '~/design-system/forms/input-link.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { Subtitle, Text } from '~/design-system/typography.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';

type Props = {
  slidesUrl: string;
  videoUrl: string;
  references: string;
  errors: SubmissionErrors;
};

export function ReferencesForm({ slidesUrl, videoUrl, references, errors }: Props) {
  const { t } = useTranslation();
  const panelId = useId();

  const hasValues = Boolean(slidesUrl || videoUrl || references);
  const hasErrors = Boolean(errors?.slidesUrl || errors?.videoUrl || errors?.references);
  const [toggled, setToggled] = useState<boolean | null>(null);
  const expanded = toggled ?? (hasValues || hasErrors);

  return (
    <div className="rounded-md border border-gray-200">
      <button
        type="button"
        onClick={() => setToggled(!expanded)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-3 p-4 text-left"
      >
        <PaperClipIcon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
        <div className="grow">
          <Text weight="medium" className="leading-6">
            {t('talk.resources.heading')}
          </Text>
          <Subtitle>{t('talk.resources.description')}</Subtitle>
        </div>
        <ChevronDownIcon
          className={cx('size-5 shrink-0 text-gray-400', { 'rotate-180': expanded })}
          aria-hidden="true"
        />
      </button>

      <div id={panelId} className={cx('space-y-6 border-t border-gray-200 p-4', { hidden: !expanded })}>
        <InputLink
          name="slidesUrl"
          label={t('talk.slides-url')}
          placeholder="https://speakerdeck.com/..."
          icon={PresentationChartBarIcon}
          defaultValue={slidesUrl}
          error={errors?.slidesUrl}
        />

        <InputLink
          name="videoUrl"
          label={t('talk.video-url')}
          placeholder="https://youtube.com/watch?v=..."
          icon={VideoCameraIcon}
          defaultValue={videoUrl}
          error={errors?.videoUrl}
        />

        <MarkdownTextArea
          name="references"
          label={t('talk.references.other')}
          description={t('talk.references.description')}
          rows={5}
          className="field-sizing-content min-h-32"
          defaultValue={references}
          error={errors?.references}
        />
      </div>
    </div>
  );
}
