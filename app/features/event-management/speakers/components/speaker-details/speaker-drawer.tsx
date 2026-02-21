import { EyeIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import type { SpeakerData } from '~/shared/types/speaker.types.ts';
import { SpeakerInfo } from './speaker-info.tsx';
import { SpeakerLinks } from './speaker-links.tsx';
import { SpeakerSurveyAnswers } from './speaker-survey-answers.tsx';
import { SpeakerTitle } from './speaker-title.tsx';

type Props = {
  team: string;
  event: string;
  speaker: SpeakerData;
  canEditSpeaker: boolean;
  children: ReactNode;
};

export function SpeakerDrawer({ team, event, speaker, canEditSpeaker, children }: Props) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={t('speaker.view-profile', { name: speaker.name })}
        onClick={() => setOpen(true)}
        className="group cursor-pointer rounded-full focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600"
      >
        {children}
      </button>

      <SlideOver
        title={<DrawerHeading team={team} event={event} speaker={speaker} canEditSpeaker={canEditSpeaker} />}
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

type SpeakerDataProps = { team: string; event: string; speaker: SpeakerData; canEditSpeaker: boolean };

function DrawerHeading({ team, event, speaker, canEditSpeaker }: SpeakerDataProps) {
  const { t } = useTranslation();

  return (
    <div className="mr-10 flex items-start justify-between gap-4">
      <SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />

      <div className="flex items-center gap-2">
        <Button
          to={href('/team/:team/:event/speakers/:speaker', { team, event, speaker: speaker.id })}
          size="sm"
          variant="secondary"
          iconLeft={EyeIcon}
        >
          {t('common.details')}
        </Button>

        {canEditSpeaker ? (
          <Button
            to={href('/team/:team/:event/speakers/:speaker/edit', { team, event, speaker: speaker.id })}
            size="sm"
            variant="secondary"
            iconLeft={PencilSquareIcon}
          >
            {t('common.edit')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
