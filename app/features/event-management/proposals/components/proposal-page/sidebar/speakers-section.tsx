import { useFetcher } from 'react-router';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { SpeakersSelectPanel } from '../../new-proposal/speakers-select-panel.tsx';

type SpeakersSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalSpeakers: Array<{
    id: string;
    name: string;
    picture?: string | null;
    company?: string | null;
  }>;
  canEditEventProposals: boolean;
  className?: string;
};

export function SpeakersSection({
  team,
  event,
  proposalId,
  proposalSpeakers,
  canEditEventProposals,
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
    <SpeakersSelectPanel
      key={proposalId}
      team={team}
      event={event}
      value={displayed.map((item) => ({
        value: item.id,
        label: item.name,
        picture: item.picture,
        data: { description: item.company },
      }))}
      onChange={(selected) => {
        update(selected);
      }}
      readonly={!canEditEventProposals}
      showAction={false}
      className={className}
    />
  );
}
