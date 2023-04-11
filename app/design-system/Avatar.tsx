import c from 'classnames';
import { Text } from './Typography';

const sizes = {
  xs: 'h-6 w-6',
  s: 'h-8 w-8',
  m: 'h-10 w-10',
  l: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-20 w-20',
  '4xl': 'h-32 w-32',
};

const text_sizes = {
  xs: 'text-sm',
  s: 'text-lg',
  m: 'text-xl',
  l: 'text-3xl',
  xl: 'text-4xl',
  '2xl': 'text-5xl',
  '4xl': 'text-6xl',
};

const square_sizes = {
  xs: 'rounded',
  s: 'rounded',
  m: 'rounded',
  l: 'rounded-md',
  xl: 'rounded-md',
  '2xl': 'rounded-md',
  '4xl': 'rounded-md',
};

const colors = [
  'bg-red-200',
  'bg-orange-200',
  'bg-cyan-200',
  'bg-blue-200',
  'bg-purple-200',
  'bg-green-200',
  'bg-rose-200',
  'bg-indigo-200',
];

const rings = { xs: 'ring-2', s: 'ring-2', m: 'ring-2', l: 'ring-2', xl: 'ring-2', '2xl': 'ring-3', '4xl': 'ring-4' };

const ringsColor = { white: 'ring-white', primary: 'ring-indigo-500' };

type AvatarProps = {
  photoURL?: string | null;
  name?: string | null;
  size?: keyof typeof sizes;
  square?: boolean;
  ring?: boolean;
  ringColor?: keyof typeof ringsColor;
  'aria-hidden'?: boolean;
  className?: string;
};

export function Avatar({
  photoURL,
  name,
  size = 's',
  square = false,
  ring = false,
  ringColor = 'primary',
  'aria-hidden': ariaHidden,
  className,
}: AvatarProps) {
  const styles = c(
    'shrink-0',
    sizes[size],
    ring ? rings[size] : null,
    ring ? ringsColor[ringColor] : null,
    square ? square_sizes[size] : 'rounded-full',
    className
  );

  if (photoURL) {
    return <AvatarImage name={name} photoURL={photoURL} className={styles} aria-hidden={ariaHidden} />;
  }
  return <AvatarColor name={name} size={size} className={styles} />;
}

type AvatarGroupProps = {
  avatars: Array<{ photoURL?: string | null; name?: string | null }>;
  size?: keyof typeof sizes;
  ring?: boolean;
  ringColor?: keyof typeof ringsColor;
  displayNames?: boolean;
};

export function AvatarGroup({ avatars, displayNames = false }: AvatarGroupProps) {
  return (
    <div className="-space-x-1 overflow-hidden truncate">
      {avatars.map((avatar) => (
        <Avatar
          key={avatar.name}
          photoURL={avatar.photoURL}
          name={avatar.name}
          size="xs"
          ring
          ringColor="white"
          className="inline-block"
          aria-hidden
        />
      ))}
      {displayNames && (
        <span className="pl-3">
          <Text as="span" variant="secondary" size="s">
            by {avatars.map((a) => a.name).join(', ')}
          </Text>
        </span>
      )}
    </div>
  );
}

type AvatarNameProps = {
  name?: string | null;
  subtitle?: string | null;
  variant?: 'primary' | 'secondary';
} & AvatarProps;

export function AvatarName({ name, subtitle, variant = 'primary', ...rest }: AvatarNameProps) {
  return (
    <div className="flex items-center">
      <Avatar {...rest} aria-hidden />
      <div className="ml-3 text-left">
        <Text variant={variant === 'primary' ? 'primary' : 'light'} size="s" strong>
          {name || 'Unknown'}
        </Text>
        <Text variant={variant === 'primary' ? 'secondary' : 'light'} size="xs">
          {subtitle}
        </Text>
      </div>
    </div>
  );
}

const getColor = (name: string) => {
  const nameCharCodeSum = name
    .split('')
    .map((char) => char.charCodeAt(0))
    .reduce((acc, curr) => acc + curr, 0);
  const colorIndex = nameCharCodeSum % colors.length;
  return colors[colorIndex];
};

type AvatarImageProps = { photoURL: string; name?: string | null; 'aria-hidden'?: boolean; className: string };

function AvatarImage({ photoURL, name, 'aria-hidden': ariaHidden, className }: AvatarImageProps) {
  return (
    <img
      className={className}
      src={photoURL}
      alt={!ariaHidden && name ? name : ''}
      aria-hidden={ariaHidden}
      loading="lazy"
    />
  );
}

function AvatarColor({
  name,
  size,
  className,
}: {
  name?: string | null;
  size: keyof typeof text_sizes;
  className: string;
}) {
  const avatarName = name || 'Unknown';
  const color = getColor(avatarName);
  const initial = avatarName.charAt(0).toUpperCase();

  return (
    <div
      className={c(
        'flex items-center justify-center font-heading font-medium text-gray-900/60',
        className,
        color,
        text_sizes[size]
      )}
    >
      {initial}
    </div>
  );
}
