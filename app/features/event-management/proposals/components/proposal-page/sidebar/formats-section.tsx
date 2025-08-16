import { useFetcher } from 'react-router';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { FormatsSelectPanel } from '../../new-proposal/formats-select-panel.tsx';

type FormatsSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalFormats: Array<{ id: string; name: string }>;
  eventFormats: Array<{ id: string; name: string }>;
  canEditEventProposals: boolean;
  canEditEvent: boolean;
  className?: string;
};

export function FormatsSection({
  team,
  event,
  proposalId,
  proposalFormats,
  eventFormats,
  canEditEventProposals,
  canEditEvent,
  className,
}: FormatsSectionProps) {
  const fetcher = useFetcher({ key: `save-formats:${proposalId}` });

  // optimistic update
  let displayed = proposalFormats;
  if (fetcher.formData?.get('intent') === 'save-formats') {
    const pending = fetcher.formData?.getAll('formats') as string[];
    displayed = eventFormats.filter((format) => pending.includes(format.id));
  }
  displayed = sortBy(displayed, 'name');

  const update = (formats: Array<{ id: string; name: string }>) => {
    const formData = new FormData();
    formData.set('intent', 'save-formats');
    for (const format of formats) {
      formData.append('formats', format.id);
    }
    fetcher.submit(formData, { method: 'POST', preventScrollReset: true });
  };

  return (
    <FormatsSelectPanel
      key={proposalId}
      team={team}
      event={event}
      value={displayed.map((item) => ({ value: item.id, label: item.name }))}
      options={eventFormats.map((item) => ({ value: item.id, label: item.name }))}
      onChange={(selected) => {
        update(selected.map((option) => eventFormats.find((item) => item.id === option.value)!).filter(Boolean));
      }}
      readonly={!canEditEventProposals}
      showAction={canEditEvent}
      className={className}
    />
  );
}
