import { Dialog } from '@headlessui/react';
import { CheckIcon, LinkIcon, TrashIcon, UserAddIcon } from '@heroicons/react/solid';
import { Form, useFetcher } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { Button } from '../components-ui/Buttons';
import Modal from '../components-ui/dialogs/Modals';
import { Text } from '../components-ui/Typography';
import { InvitationLink } from '../routes/invitation/generate';

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
        <div key={speaker.id} className="mt-4 flex justify-between items-center">
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
        className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 bg-white hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        <TrashIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </Form>
  );
}

type InviteProps = { to: InviteType; id: string };

export function InviteCoSpeakerButton({ to, id }: InviteProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="text" onClick={() => setOpen(true)} className="group flex items-center mt-4">
        <UserAddIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
        Invite a co-speaker
      </Button>
      <CoSpeakerDrawer open={open} inviteType={to} entityId={id} onClose={() => setOpen(false)} />
    </>
  );
}

type CoSpeakerDrawerProps = {
  open: boolean;
  onClose: () => void;
  inviteType: InviteType;
  entityId: string;
};

function CoSpeakerDrawer({ open, onClose, inviteType, entityId }: CoSpeakerDrawerProps) {
  const invite = useFetcher<InvitationLink>();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (invite.data?.link && open) {
      navigator.clipboard.writeText(invite.data?.link).then(() => setCopied(true));
    }
  }, [invite.data?.link, open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
          <UserAddIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
            Invite a co-speaker
          </Dialog.Title>
          <Text variant="secondary" className="mt-2">
            You can invite a co-speaker to join your talk by sharing an invitation link. Copy it and send it by email.
          </Text>
          <Text variant="secondary" className="mt-2">
            The co-speaker will be automatically added once the invitation has been accepted.
          </Text>
        </div>
      </div>
      <invite.Form method="post" action="/invitation/generate">
        <input type="hidden" name="_type" value={inviteType} />
        <input type="hidden" name="_id" value={entityId} />
        {copied ? (
          <Button type="submit" block className="mt-5 sm:mt-6 flex items-center" variant="secondary">
            <CheckIcon className="mr-3 h-5 w-5 text-green-500" aria-hidden="true" />
            Invitation link copied!
          </Button>
        ) : (
          <Button type="submit" block className="mt-5 sm:mt-6 flex items-center">
            <LinkIcon className="mr-3 h-5 w-5 text-white" aria-hidden="true" />
            Copy invitation link
          </Button>
        )}
      </invite.Form>
    </Modal>
  );
}
