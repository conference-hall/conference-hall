import { useFetcher } from 'react-router';
import type { SubmissionError } from '~/shared/types/errors.types.ts';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { SpeakersSelectPanel } from '../../new-proposal/speakers-select-panel.tsx';

type SpeakersSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalSpeakers: Array<{ userId: string | null; name: string; picture?: string | null; company?: string | null }>;
  canEditEventProposals: boolean;
  error?: SubmissionError;
  className?: string;
};

export function SpeakersSection({
  team,
  event,
  proposalId,
  proposalSpeakers,
  canEditEventProposals,
  error,
  className,
}: SpeakersSectionProps) {
  const fetcher = useFetcher({ key: 'save-speakers' });

  // optimistic update
  let displayed = proposalSpeakers;
  if (fetcher.formData?.get('intent') === 'save-speakers') {
    const pending = fetcher.formData?.getAll('speakers') as string[];
    displayed = proposalSpeakers.filter((speaker) => pending.includes(speaker.userId || ''));
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
        value: item.userId || '',
        label: item.name,
        picture: item.picture,
        data: { description: item.company },
      }))}
      onChange={(selected) => {
        update(selected);
      }}
      readonly={!canEditEventProposals}
      showAction={false}
      error={error}
      className={className}
    />
  );
}
