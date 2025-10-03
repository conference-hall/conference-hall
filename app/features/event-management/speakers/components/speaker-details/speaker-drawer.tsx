import { EyeIcon, PencilSquareIcon } from '@heroicons/react/16/solid';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href, useParams } from 'react-router';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import type { SpeakerData } from '~/shared/types/speaker.types.ts';
import { SpeakerInfo } from './speaker-info.tsx';
import { SpeakerLinks } from './speaker-links.tsx';
import { SpeakerSurveyAnswers } from './speaker-survey-answers.tsx';
import { SpeakerTitle } from './speaker-title.tsx';

type Props = {
  speaker: SpeakerData;
  canEditSpeaker: boolean;
  children: ReactNode;
};

export function SpeakerDrawer({ speaker, canEditSpeaker, children }: Props) {
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
        title={<DrawerHeading speaker={speaker} canEditSpeaker={canEditSpeaker} />}
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

type SpeakerDataProps = { speaker: SpeakerData; canEditSpeaker: boolean };

function DrawerHeading({ speaker, canEditSpeaker }: SpeakerDataProps) {
  const { t } = useTranslation();
  const { team, event } = useParams();

  return (
    <div className="flex items-start justify-between gap-4 mr-10">
      <SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />

      {team && event ? (
        <div className="flex items-center gap-2">
          <ButtonLink
            to={href('/team/:team/:event/speakers/:speaker', { team, event, speaker: speaker.id })}
            size="s"
            variant="secondary"
            iconLeft={EyeIcon}
          >
            Details
          </ButtonLink>

          {canEditSpeaker ? (
            <ButtonLink
              to={href('/team/:team/:event/speakers/:speaker/edit', { team, event, speaker: speaker.id })}
              size="s"
              variant="secondary"
              iconLeft={PencilSquareIcon}
            >
              {t('common.edit')}
            </ButtonLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
