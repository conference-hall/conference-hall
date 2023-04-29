import { TrashIcon, UserPlusIcon } from '@heroicons/react/20/solid';
import { Form } from '@remix-run/react';
import { useState } from 'react';
import { AvatarName } from '~/design-system/Avatar';
import { Button } from '../../../design-system/Buttons';
import { InvitationModal } from '../../InvitationModal';

type InviteType = 'TALK' | 'PROPOSAL';

type CoSpeakersListProps = {
  speakers: Array<{
    id: string;
    name: string | null;
    picture: string | null;
    isOwner: boolean;
  }>;
  showRemoveAction?: boolean;
  className?: string;
};

export function CoSpeakersList({ speakers, showRemoveAction = false, className }: CoSpeakersListProps) {
  return (
    <div className={className}>
      {speakers.map((speaker) => (
        <div key={speaker.id} className="mt-4 flex items-center justify-between">
          <AvatarName
            picture={speaker.picture}
            name={speaker.name || 'Unknown'}
            subtitle={speaker.isOwner ? 'Owner' : 'Co-speaker'}
          />
          {showRemoveAction && !speaker.isOwner && (
            <RemoveCoSpeakerButton speakerId={speaker.id} speakerName={speaker.name} />
          )}
        </div>
      ))}
    </div>
  );
}

type RemoveCoSpeakerButtonProps = { speakerId: string; speakerName: string | null };

function RemoveCoSpeakerButton({ speakerId, speakerName }: RemoveCoSpeakerButtonProps) {
  return (
    <Form method="POST">
      <input type="hidden" name="_action" value="remove-speaker" />
      <input type="hidden" name="_speakerId" value={speakerId} />
      <button
        type="submit"
        aria-label={`Remove speaker ${speakerName}`}
        className="inline-flex items-center rounded-full border border-transparent bg-white p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <TrashIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </Form>
  );
}

type InviteProps = { to: InviteType; id: string; invitationLink?: string; block?: boolean };

export function InviteCoSpeakerButton({ to, id, invitationLink, block }: InviteProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} iconLeft={UserPlusIcon} block={block}>
        Invite a co-speaker
      </Button>
      <InvitationModal
        open={open}
        type={to}
        id={id}
        invitationLink={invitationLink}
        onClose={() => setOpen(false)}
        title="Invite a co-speaker"
        description="You can invite a co-speaker to join your talk by sharing an invitation link. Copy it and send it by email.
            The co-speaker will be automatically added once the invitation has been accepted."
      />
    </>
  );
}
