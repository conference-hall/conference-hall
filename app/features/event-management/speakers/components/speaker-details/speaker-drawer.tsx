import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import type { SpeakerData } from '~/shared/types/speaker.types.ts';
import { SpeakerInfo } from './speaker-info.tsx';
import { SpeakerLinks } from './speaker-links.tsx';
import { SpeakerSurveyAnswers } from './speaker-survey-answers.tsx';
import { SpeakerTitle } from './speaker-title.tsx';

type Props = {
  speaker: SpeakerData;
  children: ReactNode;
};

export function SpeakerDrawer({ speaker, children }: Props) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={t('speaker.view-profile', { name: speaker.name })}
        onClick={() => setOpen(true)}
        className="cursor-pointer group rounded-full focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600"
      >
        {children}
      </button>

      <SlideOver
        title={<SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />}
        open={open}
        withBorder={false}
        onClose={() => setOpen(false)}
        size="l"
      >
        <SlideOver.Content className="space-y-6">
          <h2 className="sr-only">{t('speaker.panel.heading')}</h2>

          <SpeakerLinks email={speaker.email} location={speaker.location} socialLinks={speaker.socialLinks} />

          <SpeakerInfo bio={speaker.bio} references={speaker.references} />

          <SpeakerSurveyAnswers survey={speaker.survey} />
        </SlideOver.Content>
      </SlideOver>
    </>
  );
}
