import { useFetcher } from 'react-router';
import { sortBy } from '~/shared/utils/arrays-sort-by.ts';
import { FormatsPanel } from '../../form-panels/formats-panel.tsx';

type FormatsSectionProps = {
  team: string;
  event: string;
  proposalId: string;
  proposalFormats: Array<{ id: string; name: string }>;
  eventFormats: Array<{ id: string; name: string }>;
  multiple: boolean;
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
  multiple,
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

  const update = (ids: Array<string>) => {
    const formData = new FormData();
    formData.set('intent', 'save-formats');
    for (const id of ids) {
      formData.append('formats', id);
    }
    fetcher.submit(formData, { method: 'POST', preventScrollReset: true });
  };

  return (
    <FormatsPanel
      key={proposalId}
      team={team}
      event={event}
      value={displayed.map((item) => ({ value: item.id, label: item.name }))}
      options={eventFormats.map((item) => ({ value: item.id, label: item.name }))}
      onChange={(selected) => update(selected.map((option) => option.value))}
      multiple={multiple}
      readonly={!canEditEventProposals}
      showAction={canEditEvent}
      className={className}
    />
  );
}
