import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { PlacementOutcome, SwapOutcome } from '../../models/session-placement.ts';

// Shows the Schedule conflict message when a gesture is refused by the Placement rule. An adjusted placement is
// committed silently: only a refusal is worth a word.
export function useConflictReport() {
  const { t } = useTranslation();
  return useCallback(
    (outcome: PlacementOutcome | SwapOutcome) => {
      if (outcome.status !== 'conflict') return;
      toast.error(t('event-management.schedule.errors.session-conflict'));
    },
    [t],
  );
}
