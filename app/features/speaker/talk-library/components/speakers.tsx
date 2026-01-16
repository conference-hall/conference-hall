import { PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import type { SurveyDetailedAnswer } from '~/shared/types/survey.types.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/button.tsx';
import { InvitationModal } from '~/design-system/dialogs/invitation-modal.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { Text } from '~/design-system/typography.tsx';
import { SpeakerInfo } from '~/features/event-management/speakers/components/speaker-details/speaker-info.tsx';
import { SpeakerLinks } from '~/features/event-management/speakers/components/speaker-details/speaker-links.tsx';
import { SpeakerSurveyAnswers } from '~/features/event-management/speakers/components/speaker-details/speaker-survey-answers.tsx';
import { SpeakerTitle } from '~/features/event-management/speakers/components/speaker-details/speaker-title.tsx';

export type SpeakerProps = {
  userId: string | null;
  name: string;
  email?: string;
  picture?: string | null;
  company?: string | null;
  bio?: string | null;
  references?: string | null;
  location?: string | null;
  survey?: Array<SurveyDetailedAnswer>;
  socialLinks?: Array<string>;
  isCurrentUser?: boolean;
};

type CoSpeakersProps = {
  speakers: Array<SpeakerProps>;
  invitationLink?: string;
  canEdit: boolean;
  className?: string;
};

export function Speakers({ speakers, invitationLink, canEdit, className }: CoSpeakersProps) {
  const { t } = useTranslation();
  return (
    <ul aria-label={t('speaker.list')} className={cx('flex flex-row flex-wrap gap-3', className)}>
      {speakers.map((speaker) => (
        <li key={speaker.name}>
          <SpeakerPillButton speaker={speaker} canEdit={canEdit} />
        </li>
      ))}
      {canEdit && invitationLink && (
        <li>
          <AddCoSpeakerButton invitationLink={invitationLink} />
        </li>
      )}
    </ul>
  );
}

type SpeakerPillProps = { speaker: Pick<SpeakerProps, 'name' | 'picture'>; className?: string };

export function SpeakerPill({ speaker, className }: SpeakerPillProps) {
  return (
    <span className={cx('flex items-center gap-2 rounded-full border border-gray-200 p-1 pr-3', className)}>
      <Avatar name={speaker.name} picture={speaker.picture} size="xs" />
      <Text weight="medium" size="xs" variant="secondary" truncate>
        {speaker.name}
      </Text>
    </span>
  );
}

type SpeakerPillButtonProps = { speaker: SpeakerProps; canEdit?: boolean };

function SpeakerPillButton({ speaker, canEdit }: SpeakerPillButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={t('speaker.view-profile', { name: speaker.name })}
        onClick={() => setOpen(true)}
        className="cursor-pointer"
      >
        <SpeakerPill speaker={speaker} className="hover:bg-gray-100" />
      </button>

      <SpeakerDrawer
        speaker={speaker}
        canEdit={canEdit && !speaker.isCurrentUser}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

type RemoveCoSpeakerButtonProps = { speakerId: string; speakerName: string | null };

function RemoveCoSpeakerButton({ speakerId, speakerName }: RemoveCoSpeakerButtonProps) {
  const { t } = useTranslation();
  return (
    <Form method="POST">
      <input type="hidden" name="_speakerId" value={speakerId} />
      <Button type="submit" name="intent" value="remove-speaker" variant="secondary">
        {t('speaker.remove', { name: speakerName })}
      </Button>
    </Form>
  );
}

type AddCoSpeakerProps = { invitationLink: string };

function AddCoSpeakerButton({ invitationLink }: AddCoSpeakerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-200 p-1 pr-3 hover:bg-gray-100"
      >
        <PlusIcon className="h-6 w-6 shrink-0 text-gray-400" aria-hidden />
        <Text variant="secondary" size="xs">
          {t('speaker.add')}
        </Text>
      </button>
      <InvitationModal
        open={open}
        invitationLink={invitationLink}
        onClose={() => setOpen(false)}
        title={t('speaker.invite-modal.heading')}
        description={t('speaker.invite-modal.description')}
      />
    </>
  );
}

type SpeakerDrawerProps = { speaker: SpeakerProps; canEdit?: boolean; open: boolean; onClose: VoidFunction };

function SpeakerDrawer({ speaker, canEdit, open, onClose }: SpeakerDrawerProps) {
  const { t } = useTranslation();

  return (
    <SlideOver
      title={<SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />}
      open={open}
      withBorder={false}
      onClose={onClose}
      size="l"
    >
      <SlideOver.Content className="space-y-6">
        <h2 className="sr-only">{t('speaker.panel.heading')}</h2>

        <SpeakerLinks email={speaker.email} location={speaker.location} socialLinks={speaker.socialLinks} />

        {canEdit && speaker.userId && <RemoveCoSpeakerButton speakerId={speaker.userId} speakerName={speaker.name} />}

        <SpeakerInfo bio={speaker.bio} references={speaker.references} />

        <SpeakerSurveyAnswers survey={speaker.survey} />
      </SlideOver.Content>
    </SlideOver>
  );
}
