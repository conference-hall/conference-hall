import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Badge } from './badges.tsx';

type FilterTagProps = { name: string; value?: string; specificValue?: string };

export function FilterTag({ name, value, specificValue }: FilterTagProps) {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  if (!value) return null;

  const onClick = async () => {
    if (specificValue !== undefined) {
      const remaining = params.getAll(name).filter((v) => v !== specificValue);
      params.delete(name);
      for (const v of remaining) params.append(name, v);
    } else {
      params.delete(name);
    }
    await navigate({ pathname: location.pathname, search: params.toString() });
  };

  return (
    <Badge onClose={onClick} closeLabel={value}>
      {value}
    </Badge>
  );
}
