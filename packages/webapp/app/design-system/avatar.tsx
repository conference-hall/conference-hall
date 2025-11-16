import { cx } from 'class-variance-authority';
import { generateGradientColor } from '../../../shared/src/colors/colors.ts';
import { Tooltip } from './tooltip.tsx';
import { Text } from './typography.tsx';

const sizes = {
  xs: '24px',
  s: '32px',
  m: '40px',
  l: '48px',
  xl: '64px',
  '2xl': '80px',
  '4xl': '128px',
};

const sizes_tw = {
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
  xs: 'rounded-sm',
  s: 'rounded-sm',
  m: 'rounded-sm',
  l: 'rounded-md',
  xl: 'rounded-md',
  '2xl': 'rounded-md',
  '4xl': 'rounded-md',
};

const rings = { xs: 'ring-2', s: 'ring-2', m: 'ring-2', l: 'ring-2', xl: 'ring-2', '2xl': 'ring-3', '4xl': 'ring-4' };

const ringsColor = { white: 'ring-white', primary: 'ring-indigo-500' };

type AvatarProps = {
  picture?: string | null;
  name?: string | null;
  size?: keyof typeof sizes;
  square?: boolean;
  ring?: boolean;
  ringColor?: keyof typeof ringsColor;
  'aria-hidden'?: boolean;
  className?: string;
};

export function Avatar({
  picture,
  name,
  size = 's',
  square = false,
  ring = false,
  ringColor = 'primary',
  'aria-hidden': ariaHidden,
  className,
}: AvatarProps) {
  const styles = cx(
    'shrink-0 bg-white',
    sizes_tw[size],
    ring ? rings[size] : null,
    ring ? ringsColor[ringColor] : null,
    square ? square_sizes[size] : 'rounded-full',
    className,
  );

  if (picture) {
    return <AvatarImage name={name} picture={picture} className={styles} size={size} aria-hidden={ariaHidden} />;
  }
  return <AvatarColor name={name} size={size} className={styles} />;
}

type AvatarNameProps = {
  name?: string | null;
  subtitle?: string | null;
  variant?: 'primary' | 'secondary';
  truncate?: boolean;
} & AvatarProps;

export function AvatarName({ name, subtitle, variant = 'primary', truncate, ...rest }: AvatarNameProps) {
  return (
    <div className="flex items-center">
      <Avatar name={name} {...rest} aria-hidden />
      <div className={cx('ml-2 text-left', { truncate })}>
        <Text variant={variant === 'primary' ? 'primary' : 'light'} weight="medium" truncate={truncate}>
          {name || 'Unknown'}
        </Text>
        <Text variant={variant === 'primary' ? 'secondary' : 'light'} size="xs" truncate={truncate}>
          {subtitle}
        </Text>
      </div>
    </div>
  );
}

type AvatarImageProps = {
  picture: string;
  name?: string | null;
  'aria-hidden'?: boolean;
  size: keyof typeof sizes;
  className: string;
};

function AvatarImage({ picture, name, 'aria-hidden': ariaHidden, size, className }: AvatarImageProps) {
  return (
    <img
      className={cx('outline -outline-offset-1 outline-black/5', className)}
      src={picture}
      height={sizes[size]}
      width={sizes[size]}
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
  const gradient = generateGradientColor(avatarName);
  const initial = avatarName.charAt(0).toUpperCase();

  return (
    <div
      className={cx('flex items-center justify-center font-medium text-gray-900/70', className, text_sizes[size])}
      style={{ height: sizes[size], width: sizes[size], background: gradient }}
    >
      {initial}
    </div>
  );
}

type AvatarGroupProps = {
  avatars: Array<{ picture?: string | null; name?: string | null }>;
  size?: keyof typeof sizes;
  className?: string;
};

export function AvatarGroup({ avatars, size, className }: AvatarGroupProps) {
  return (
    <div className={cx('flex flex-nowrap -space-x-1 shrink-0 overflow-hidden', className)}>
      {avatars.map((avatar, index) => (
        <Tooltip key={index} text={avatar.name}>
          <Avatar name={avatar.name} picture={avatar.picture} size={size} className="ring-2 ring-white" />
        </Tooltip>
      ))}
    </div>
  );
}
