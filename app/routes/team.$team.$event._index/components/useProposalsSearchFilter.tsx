import { useLocation, useNavigate, useSearchParams } from '@remix-run/react';
import { useCallback } from 'react';

export function useProposalsSearchFilter() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const filterPathFor = useCallback(
    (name: string, value: string) => {
      if (value) {
        searchParams.set(name, value);
      } else {
        searchParams.delete(name);
      }
      return { pathname, search: searchParams.toString() };
    },
    [pathname, searchParams],
  );

  const addFilterFor = useCallback(
    (name: string, value: string) => {
      navigate(filterPathFor(name, value));
    },
    [navigate, filterPathFor],
  );

  return { resetPath: pathname, filterPathFor, addFilterFor };
}
