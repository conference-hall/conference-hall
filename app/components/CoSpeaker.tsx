import { Dialog } from '@headlessui/react';
import { BanIcon, LinkIcon, TrashIcon, UserAddIcon } from '@heroicons/react/solid';
import { Form, useFetcher } from '@remix-run/react';
import { useState } from 'react';
import { Button } from '../design-system/Buttons';
import Modal from '../design-system/dialogs/Modals';
import { CopyInput } from '../design-system/forms/CopyInput';
import { Text } from '../design-system/Typography';
import type { InvitationLink } from '../routes/invitation/generate';

type InviteType = 'TALK' | 'PROPOSAL';

type CoSpeakersListProps = {
  speakers: Array<{
    id: string;
    name: string | null;
    photoURL: string | null;
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
          <div className="flex items-center">
            <img
              className="inline-block h-9 w-9 rounded-full"
              src={speaker.photoURL || 'http://placekitten.com/100/100'}
              alt={speaker.name || 'Co-speaker'}
            />
            <div className="ml-3">
              <Text>{speaker.name}</Text>
              <Text variant="secondary" size="xs">
                {speaker.isOwner ? 'Owner' : 'Co-speaker'}
              </Text>
            </div>
          </div>
          {showRemoveAction && !speaker.isOwner && <RemoveCoSpeakerButton speakerId={speaker.id} />}
        </div>
      ))}
    </div>
  );
}

type RemoveCoSpeakerButtonProps = { speakerId: string };

function RemoveCoSpeakerButton({ speakerId }: RemoveCoSpeakerButtonProps) {
  return (
    <Form method="post">
      <input type="hidden" name="_action" value="remove-speaker" />
      <input type="hidden" name="_speakerId" value={speakerId} />
      <button
        type="submit"
        className="inline-flex items-center rounded-full border border-transparent bg-white p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <TrashIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </Form>
  );
}

type InviteProps = { to: InviteType; id: string; invitationLink?: string };

export function InviteCoSpeakerButton({ to, id, invitationLink }: InviteProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="text" onClick={() => setOpen(true)} className="group mt-4 flex items-center">
        <UserAddIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        Invite a co-speaker
      </Button>
      <CoSpeakerDrawer
        open={open}
        inviteType={to}
        entityId={id}
        invitationLink={invitationLink}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

type CoSpeakerDrawerProps = {
  open: boolean;
  onClose: () => void;
  invitationLink?: string;
  inviteType: InviteType;
  entityId: string;
};

function CoSpeakerDrawer({ open, onClose, invitationLink, inviteType, entityId }: CoSpeakerDrawerProps) {
  const invite = useFetcher<InvitationLink>();

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <UserAddIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
            Invite a co-speaker
          </Dialog.Title>
          <Text variant="secondary" className="mt-4">
            You can invite a co-speaker to join your talk by sharing an invitation link. Copy it and send it by email.
            The co-speaker will be automatically added once the invitation has been accepted.
          </Text>
        </div>
      </div>
      {invitationLink && (
        <CopyInput aria-label="Copy co-speaker invitation link" value={invitationLink} disabled className="mt-8" />
      )}
      {invitationLink ? (
        <invite.Form method="post" action="/invitation/revoke">
          <input type="hidden" name="_type" value={inviteType} />
          <input type="hidden" name="_id" value={entityId} />
          <Button type="submit" block className="mt-8 flex items-center" variant="secondary">
            <BanIcon className="mr-3 h-5 w-5 text-gray-500" aria-hidden="true" />
            Revoke invitation link
          </Button>
        </invite.Form>
      ) : (
        <invite.Form method="post" action="/invitation/generate">
          <input type="hidden" name="_type" value={inviteType} />
          <input type="hidden" name="_id" value={entityId} />
          <Button type="submit" block className="mt-8 flex items-center">
            <LinkIcon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
            Generate invitation link
          </Button>
        </invite.Form>
      )}
    </Modal>
  );
}
