import { PlusIcon } from '@heroicons/react/20/solid';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { Form } from 'react-router';
import type { SurveyDetailedAnswer } from '~/.server/event-survey/types.ts';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { IconLabel } from '~/design-system/icon-label.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { SocialLink } from '~/design-system/social-link.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { InvitationModal } from '../invitation-modal.tsx';

export type SpeakerProps = {
  id: string;
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
  return (
    <ul aria-label="Speakers" className={cx('flex flex-row flex-wrap gap-3', className)}>
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

export function SpeakerPillButton({ speaker, canEdit }: SpeakerPillButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-label={`View ${speaker.name} profile`} onClick={() => setOpen(true)}>
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

type SpeakerPillProps = { speaker: SpeakerProps; className?: string };

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

export function RemoveCoSpeakerButton({ speakerId, speakerName }: RemoveCoSpeakerButtonProps) {
  return (
    <Form method="POST">
      <input type="hidden" name="_speakerId" value={speakerId} />
      <Button type="submit" name="intent" value="remove-speaker" variant="secondary">
        {`Remove "${speakerName}" from the talk`}
      </Button>
    </Form>
  );
}

type AddCoSpeakerProps = { invitationLink: string };

function AddCoSpeakerButton({ invitationLink }: AddCoSpeakerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add a co-speaker"
        className="flex items-center gap-1 hover:bg-gray-100 p-1 pr-3 rounded-full border border-gray-200"
      >
        <PlusIcon className="h-6 w-6 text-gray-400 shrink-0" aria-hidden />
        <Text variant="secondary" size="xs">
          Add speaker
        </Text>
      </button>
      <InvitationModal
        open={open}
        invitationLink={invitationLink}
        onClose={() => setOpen(false)}
        title="Invite a co-speaker"
        description="You can invite a co-speaker to join your talk by sharing an invitation link. Copy it and send it by email.
            The co-speaker will be automatically added once the invitation has been accepted."
      />
    </>
  );
}

type SpeakerDrawerProps = { speaker: SpeakerProps; canEdit?: boolean; open: boolean; onClose: VoidFunction };

function SpeakerDrawer({ speaker, canEdit, open, onClose }: SpeakerDrawerProps) {
  const Title = () => <SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />;

  const details = [
    { key: 'bio', label: 'Biography', value: speaker.bio },
    { key: 'references', label: 'References', value: speaker.references },
    { key: 'location', label: 'Location', value: speaker.location },
  ].filter((detail) => Boolean(detail.value));

  return (
    <SlideOver open={open} onClose={onClose} size="l">
      <SlideOver.Content title={<Title />} onClose={onClose} className="p-0! border-t border-t-gray-200 divide-y">
        <h2 className="sr-only">Speaker information panel</h2>
        {speaker.email && (
          <div className="flex flex-col gap-2 p-4 sm:px-6">
            <IconLabel icon={EnvelopeIcon}>{speaker.email}</IconLabel>
            {speaker.socialLinks?.map((socialLink) => (
              <SocialLink key={socialLink} url={socialLink} />
            ))}
          </div>
        )}

        {canEdit && (
          <div className="p-6">
            <RemoveCoSpeakerButton speakerId={speaker.id} speakerName={speaker.name} />
          </div>
        )}

        <dl className="divide-y">
          {details.map((detail) => (
            <div key={detail.label} className="px-4 py-6 sm:px-6">
              <dt className="text-sm font-medium leading-6 text-gray-900">{detail.label}</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 break-words">
                {(detail.key === 'bio' || detail.key === 'references') && detail.value ? (
                  <Markdown>{detail.value as string}</Markdown>
                ) : (
                  detail.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        {speaker.survey && speaker.survey.length > 0 ? (
          <section className="px-4 py-6 sm:px-6 space-y-6">
            <H2 variant="secondary">Survey</H2>
            <dl className="space-y-4">
              {speaker.survey?.map((question) => (
                <div key={question.id}>
                  <dt className="text-sm font-medium leading-6 text-gray-900">{question.label}</dt>
                  <dd className="text-sm leading-6 text-gray-700 break-words">
                    {question.type === 'text' ? question.answer : question.answers?.map((a) => a.label).join(', ')}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </SlideOver.Content>
    </SlideOver>
  );
}

type SpeakerTitleProps = { name: string | null; picture?: string | null; company?: string | null };

function SpeakerTitle({ name, picture, company }: SpeakerTitleProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar picture={picture} name={name} size="l" />

      <div className="overflow-hidden">
        <Text weight="bold" size="xl" truncate>
          {name}
        </Text>
        <Text variant="secondary" weight="normal" truncate>
          {company}
        </Text>
      </div>
    </div>
  );
}
