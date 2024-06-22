import { useOutletContext } from '@remix-run/react';

import type { ResultsStatistics } from '~/.server/publications/publication';

export const useStatistics = () => {
  const statistics = useOutletContext<ResultsStatistics>();
  return statistics;
};
