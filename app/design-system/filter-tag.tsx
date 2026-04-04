import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Badge } from './badges.tsx';

type FilterTagProps = { name: string; value?: string };

export function FilterTag({ name, value }: FilterTagProps) {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  if (!value) return null;

  const onClick = async () => {
    params.delete(name);
    await navigate({ pathname: location.pathname, search: params.toString() });
  };

  return (
    <Badge onClose={onClick} closeLabel={value}>
      {value}
    </Badge>
  );
}
