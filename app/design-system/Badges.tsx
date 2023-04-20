import c from 'classnames';

const BORDER_VARIANT = {
  gray: 'bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10',
  red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
  yellow: 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
  green: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
  indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10',
  pink: 'bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-700/10',
};

const DOT_VARIANT = 'gap-x-1.5 text-gray-900 ring-1 ring-inset ring-gray-200';

const DOT_COLORS = {
  gray: 'fill-gray-500',
  red: 'fill-red-500',
  yellow: 'fill-yellow-500',
  green: 'fill-green-500',
  blue: 'fill-blue-500',
  indigo: 'fill-indigo-500',
  purple: 'fill-purple-500',
  pink: 'fill-pink-500',
};

type Props = {
  variant?: 'border' | 'dot';
  color?: keyof typeof BORDER_VARIANT;
  pill?: boolean;
  children: React.ReactNode;
};

export default function Badge({ variant = 'border', color = 'gray', pill = false, children }: Props) {
  return (
    <span
      className={c(
        'inline-flex items-center px-2 py-1 text-xs font-medium',
        pill ? 'rounded-full' : 'rounded-md',
        { [BORDER_VARIANT[color]]: variant === 'border' },
        { [DOT_VARIANT]: variant === 'dot' }
      )}
    >
      {variant === 'dot' && <Dot color={color} />}
      {children}
    </span>
  );
}

export function Dot({ color }: { color: keyof typeof DOT_COLORS }) {
  return (
    <svg className={c('h-1.5 w-1.5', DOT_COLORS[color])} viewBox="0 0 6 6" aria-hidden="true">
      <circle cx={3} cy={3} r={3} />
    </svg>
  );
}
