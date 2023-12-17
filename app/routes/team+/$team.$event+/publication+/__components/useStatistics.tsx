import { useOutletContext } from '@remix-run/react';

import type { ResultsStatistics } from '~/.server/proposal-publication/Publication';

export const useStatistics = () => {
  const statistics = useOutletContext<ResultsStatistics>();
  return statistics;
};
