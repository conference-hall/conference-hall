import { PlusIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import { useState } from 'react';

import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { SlideOver } from '~/design-system/dialogs/slide-over.tsx';
import { IconExternalLink } from '~/design-system/icon-buttons.tsx';
import { GitHubIcon } from '~/design-system/icons/github-icon.tsx';
import { TwitterIcon } from '~/design-system/icons/twitter-icon.tsx';
import { Markdown } from '~/design-system/markdown.tsx';
import { Text } from '~/design-system/typography.tsx';

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
  survey?: {
    gender: string | null;
    tshirt: string | null;
    diet?: Array<string> | null;
    accomodation: string | null;
    transports?: Array<string> | null;
    info: string | null;
  };
  socials?: {
    twitter?: string | null;
    github?: string | null;
  };
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

type SpeakerDrawerProps = { speaker: SpeakerProps; canEdit?: boolean; open: boolean; onClose: () => void };

function SpeakerDrawer({ speaker, canEdit, open, onClose }: SpeakerDrawerProps) {
  const Title = () => <SpeakerTitle name={speaker.name} picture={speaker.picture} company={speaker.company} />;

  const details = [
    { key: 'bio', label: 'Biography', value: speaker.bio },
    { key: 'references', label: 'References', value: speaker.references },
    { key: 'location', label: 'Location', value: speaker.location },
    { key: 'gender', label: 'Gender', value: speaker.survey?.gender },
    { key: 'tshirt', label: 'Tshirt size', value: speaker.survey?.tshirt },
    { key: 'diet', label: 'Diet', value: speaker.survey?.diet?.join(', ') },
    { key: 'accomodation', label: 'Need accomodation fees', value: speaker.survey?.accomodation },
    { key: 'transports', label: 'Need Transport fees', value: speaker.survey?.transports?.join(', ') },
    { key: 'survey', label: 'More information', value: speaker.survey?.info },
  ].filter((detail) => Boolean(detail.value));

  return (
    <SlideOver open={open} onClose={onClose} size="l">
      <SlideOver.Content title={<Title />} onClose={onClose} className="!p-0 border-t border-t-gray-200 divide-y">
        {speaker.email && (
          <div className="flex items-center gap-4 p-4 sm:px-6">
            <div className="flex-1 overflow-hidden">
              <Text size="s" variant="secondary" truncate>
                {speaker.email}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              {speaker.socials?.twitter && (
                <IconExternalLink
                  href={`https://twitter.com/${speaker.socials.twitter}`}
                  icon={TwitterIcon}
                  label="Twitter link"
                  variant="secondary"
                />
              )}
              {speaker.socials?.github && (
                <IconExternalLink
                  href={`https://github.com/${speaker.socials.github}`}
                  icon={GitHubIcon}
                  label="Github link"
                  variant="secondary"
                />
              )}
            </div>
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
                  <Markdown>{detail.value}</Markdown>
                ) : (
                  detail.value
                )}
              </dd>
            </div>
          ))}
        </dl>
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
