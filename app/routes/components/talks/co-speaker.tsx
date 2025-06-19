import { PlusIcon } from '@heroicons/react/20/solid';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import type { SurveyDetailedAnswer } from '~/.server/event-survey/types.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { SocialLink } from '~/design-system/social-link.tsx';
import { Text } from '~/design-system/typography.tsx';
import { InvitationModal } from '../modals/invitation-modal.tsx';

export type SpeakerProps = {
  userId: string | null;
  name: string | null;
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

export function CoSpeakers({ speakers, invitationLink, canEdit, className }: CoSpeakersProps) {
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

type SpeakerPillProps = { speaker: Pick<SpeakerProps, 'name' | 'picture'>; className?: string };

export function SpeakerPill({ speaker, className }: SpeakerPillProps) {
  return (
    <span className={cx('flex items-center gap-2  p-1 pr-3 rounded-full border border-gray-200', className)}>
      <Avatar name={speaker.name} picture={speaker.picture} size="xs" />
      <Text weight="medium" size="xs" variant="secondary" truncate>
        {speaker.name}
      </Text>
    </span>
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
        className="flex items-center gap-1 hover:bg-gray-100 p-1 pr-3 rounded-full border border-gray-200 cursor-pointer"
      >
        <PlusIcon className="h-6 w-6 text-gray-400 shrink-0" aria-hidden />
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

        <SpeakerContacts speaker={speaker} />

        {canEdit && speaker.userId && <RemoveCoSpeakerButton speakerId={speaker.userId} speakerName={speaker.name} />}

        <SpeakerDetails speaker={speaker} />

        <SpeakerSurveyAnwers survey={speaker.survey} />
      </SlideOver.Content>
    </SlideOver>
  );
}

type SpeakerTitleProps = { name: string | null; picture?: string | null; company?: string | null };

export function SpeakerTitle({ name, picture, company }: SpeakerTitleProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar picture={picture} name={name} size="l" />

      <div className="overflow-hidden">
        <Text weight="semibold" size="base" truncate>
          {name}
        </Text>
        <Text variant="secondary" weight="normal" truncate>
          {company}
        </Text>
      </div>
    </div>
  );
}

type SpeakerContactsProps = { speaker: SpeakerProps; className?: string };

export function SpeakerContacts({ speaker, className }: SpeakerContactsProps) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <IconLabel icon={EnvelopeIcon}>{speaker.email}</IconLabel>

      {speaker.socialLinks?.map((socialLink) => (
        <SocialLink key={socialLink} url={socialLink} />
      ))}
    </div>
  );
}

type SpeakerDetailsProps = { speaker: SpeakerProps; className?: string };

function SpeakerDetails({ speaker, className }: SpeakerDetailsProps) {
  const { t } = useTranslation();

  const details = [
    { key: 'bio', label: t('speaker.profile.biography'), value: speaker.bio },
    { key: 'references', label: t('speaker.profile.references'), value: speaker.references },
    { key: 'location', label: t('speaker.profile.location'), value: speaker.location },
  ].filter((detail) => Boolean(detail.value));

  return details.map((detail) => (
    <div key={detail.label} className={className}>
      <div className="text-sm font-medium leading-6 text-gray-900">{detail.label}</div>
      <div className="mt-1 text-sm leading-6 text-gray-700 break-words">
        {(detail.key === 'bio' || detail.key === 'references') && detail.value ? (
          <Markdown>{detail.value as string}</Markdown>
        ) : (
          detail.value
        )}
      </div>
    </div>
  ));
}

type SpeakerSurveyAnswer = { survey?: Array<SurveyDetailedAnswer>; className?: string };

export function SpeakerSurveyAnwers({ survey, className }: SpeakerSurveyAnswer) {
  if (!survey || survey.length === 0) {
    return null;
  }

  return survey?.map((question) => (
    <div key={question.id} className={className}>
      <div className="text-sm font-medium leading-6 text-gray-900">{question.label}</div>
      <div className="text-sm leading-6 text-gray-700 break-words">
        {question.type === 'text' ? question.answer : question.answers?.map((a) => a.label).join(', ')}
      </div>
    </div>
  ));
}
