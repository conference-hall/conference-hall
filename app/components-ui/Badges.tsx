import c from 'classnames';

const badgeSizes = {
  base: 'text-xs px-2.5 py-0.5',
  large: 'text-sm px-3 py-0.5',
};

const badgeColors = {
  gray: 'bg-gray-100 text-gray-800',
  red: 'bg-red-100 text-red-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  green: 'bg-green-100 text-green-800',
  blue: 'bg-blue-100 text-blue-800',
  indigo: 'bg-indigo-100 text-indigo-800',
  purple: 'bg-purple-100 text-purple-800',
  pink: 'bg-pink-100 text-pink-800',
};

type Props = {
  size?: keyof typeof badgeSizes;
  color?: keyof typeof badgeColors;
  rounded?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function Badge({
  size = 'base',
  color = 'gray',
  rounded = true,
  children,
  className,
}: Props) {
  const style = c(
    'inline-flex items-center font-medium',
    badgeSizes[size],
    badgeColors[color],
    rounded ? 'rounded-full' : 'rounded',
    className
  );
  return <span className={style}>{children}</span>;
}
