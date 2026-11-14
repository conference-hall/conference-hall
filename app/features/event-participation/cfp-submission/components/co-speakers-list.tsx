import { PlusIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { InvitationModal } from '~/design-system/dialogs/invitation-modal.tsx';
import { Text } from '~/design-system/typography.tsx';
import { isMaxSpeakersExceeded, isMaxSpeakersReached } from '../models/max-speakers.ts';

type Speaker = { userId: string | null; name: string; picture: string | null; isCurrentUser: boolean };

type Props = {
  speakers: Array<Speaker>;
  maxSpeakersPerProposal: number | null;
  invitationLink: string;
  canEdit: boolean;
};

export function CoSpeakersList({ speakers, maxSpeakersPerProposal, invitationLink, canEdit }: Props) {
  const { t } = useTranslation();
  const exceeded = isMaxSpeakersExceeded(speakers.length, maxSpeakersPerProposal);
  const reached = isMaxSpeakersReached(speakers.length, maxSpeakersPerProposal);

  return (
    <ul aria-label={t('speaker.list')} className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">
      {speakers.map((speaker, index) => (
        <li
          key={speaker.userId ?? speaker.name}
          className={cx('flex items-center gap-3 px-4 py-3', {
            'bg-red-50': maxSpeakersPerProposal !== null && index >= maxSpeakersPerProposal,
          })}
        >
          <Avatar name={speaker.name} picture={speaker.picture} size="s" />
          <div className="flex items-baseline gap-2">
            <Text weight="medium">{speaker.name}</Text>
            {speaker.isCurrentUser ? (
              <Text variant="secondary" size="xs">
                {t('event.submission.speakers.you')}
              </Text>
            ) : null}
          </div>
          {canEdit && !speaker.isCurrentUser && speaker.userId ? (
            <Form method="POST" className="ml-auto">
              <input type="hidden" name="_speakerId" value={speaker.userId} />
              <button
                type="submit"
                name="intent"
                value="remove-speaker"
                aria-label={t('speaker.remove', { name: speaker.name })}
                className="cursor-pointer text-sm font-medium text-red-700 hover:underline"
              >
                {t('common.remove')}
              </button>
            </Form>
          ) : null}
        </li>
      ))}

      <li className="px-4 py-3">
        {maxSpeakersPerProposal !== null && reached ? (
          <Text size="xs" className={cx({ 'text-red-700': exceeded })} variant={exceeded ? undefined : 'secondary'}>
            {t('event.submission.speakers.limit', { count: maxSpeakersPerProposal })}{' '}
            {exceeded
              ? t('event.submission.speakers.remove-to-continue', {
                  count: speakers.length - maxSpeakersPerProposal,
                })
              : t('event.submission.speakers.cannot-invite')}
          </Text>
        ) : canEdit ? (
          <InviteCoSpeakerButton
            invitationLink={invitationLink}
            remaining={maxSpeakersPerProposal !== null ? maxSpeakersPerProposal - speakers.length : null}
          />
        ) : null}
      </li>
    </ul>
  );
}

type InviteCoSpeakerButtonProps = { invitationLink: string; remaining: number | null };

function InviteCoSpeakerButton({ invitationLink, remaining }: InviteCoSpeakerButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
      >
        <PlusIcon className="size-5" aria-hidden />
        {t('speaker.add')}
        {remaining !== null ? (
          <span className="font-normal text-gray-500">
            ({t('event.submission.speakers.remaining', { count: remaining })})
          </span>
        ) : null}
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
