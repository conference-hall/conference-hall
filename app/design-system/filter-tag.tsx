import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Badge } from './badges.tsx';

type FilterTagProps = { name: string; value?: string };

export function FilterTag({ name, value }: FilterTagProps) {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  if (!value) return null;

  const onClick = () => {
    params.delete(name);
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  return (
    <Badge onClose={onClick} closeLabel={value}>
      {value}
    </Badge>
  );
}
