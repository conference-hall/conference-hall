import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

type FilterTagProps = {
  name: string;
  value?: string;
};

export function FilterTag({ name, value }: FilterTagProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  if (!value) return null;

  const onClick = () => {
    params.delete(name);
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  return (
    <span className="inline-flex items-center gap-x-0.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
      {value}
      <button
        type="button"
        onClick={onClick}
        className="group relative -mr-1 h-3.5 w-3.5 rounded-xs hover:bg-blue-600/20"
      >
        <span className="sr-only">{t('common.remove')}</span>
        <svg
          role="presentation"
          viewBox="0 0 14 14"
          className="h-3.5 w-3.5 stroke-blue-700/50 group-hover:stroke-blue-700/75"
        >
          <path d="M4 4l6 6m0-6l-6 6" />
        </svg>
        <span className="absolute -inset-1" />
      </button>
    </span>
  );
}
