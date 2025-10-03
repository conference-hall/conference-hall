import { useFetcher } from 'react-router';
import type { SpeakerData } from '~/shared/types/speaker.types.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { SpeakersPanel } from '../../form-panels/speakers-panel.tsx';

type SpeakersSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalSpeakers: Array<SpeakerData>;
  canChangeSpeakers: boolean;
  canCreateSpeaker: boolean;
  canEditSpeaker: boolean;
  className?: string;
};

export function SpeakersSection({
  team,
  event,
  proposalId,
  proposalSpeakers,
  canChangeSpeakers,
  canCreateSpeaker,
  canEditSpeaker,
  className,
}: SpeakersSectionProps) {
  const fetcher = useFetcher({ key: `save-speakers:${proposalId}` });

  // optimistic update
  let displayed = proposalSpeakers;
  if (fetcher.formData?.get('intent') === 'save-speakers') {
    const pending = fetcher.formData?.getAll('speakers') as string[];
    displayed = proposalSpeakers.filter((speaker) => pending.includes(speaker.id));
  }
  displayed = sortBy(displayed, 'name');

  const update = (
    speakers: Array<{ value: string; label: string; picture?: string | null; data?: { description?: string | null } }>,
  ) => {
    const formData = new FormData();
    formData.set('intent', 'save-speakers');
    for (const speaker of speakers) {
      formData.append('speakers', speaker.value);
    }
    fetcher.submit(formData, { method: 'POST', preventScrollReset: true });
  };

  return (
    <SpeakersPanel
      key={proposalId}
      team={team}
      event={event}
      value={displayed.map((item) => ({
        value: item.id,
        label: item.name,
        picture: item.picture,
        data: { description: item.company },
      }))}
      speakersDetails={proposalSpeakers}
      onChange={(selected) => {
        update(selected);
      }}
      canChangeSpeakers={canChangeSpeakers}
      canCreateSpeaker={canCreateSpeaker}
      canEditSpeaker={canEditSpeaker}
      allowEmpty={false}
      className={className}
    />
  );
}
