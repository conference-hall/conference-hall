import { cva, cx } from 'class-variance-authority';
import { generateGradientColor } from '~/shared/colors/colors.ts';
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

const avatarStyles = cva('shrink-0 bg-white', {
  variants: {
    size: {
      xs: 'h-6 w-6',
      s: 'h-8 w-8',
      m: 'h-10 w-10',
      l: 'h-12 w-12',
      xl: 'h-16 w-16',
      '2xl': 'h-20 w-20',
      '4xl': 'h-32 w-32',
    },
    square: {
      true: '',
      false: 'rounded-full',
    },
    ring: {
      true: '',
      false: '',
    },
    ringColor: {
      white: '',
      primary: '',
    },
  },
  compoundVariants: [
    { square: true, size: 'xs', className: 'rounded-sm' },
    { square: true, size: 's', className: 'rounded-sm' },
    { square: true, size: 'm', className: 'rounded-sm' },
    { square: true, size: 'l', className: 'rounded-md' },
    { square: true, size: 'xl', className: 'rounded-md' },
    { square: true, size: '2xl', className: 'rounded-md' },
    { square: true, size: '4xl', className: 'rounded-md' },
    { ring: true, size: ['xs', 's', 'm', 'l', 'xl'], className: 'ring-2' },
    { ring: true, size: '2xl', className: 'ring-3' },
    { ring: true, size: '4xl', className: 'ring-4' },
    { ring: true, ringColor: 'white', className: 'ring-white' },
    { ring: true, ringColor: 'primary', className: 'ring-indigo-500' },
  ],
  defaultVariants: {
    size: 's',
    square: false,
    ring: false,
    ringColor: 'primary',
  },
});

const initialStyles = cva('', {
  variants: {
    size: {
      xs: 'text-sm',
      s: 'text-lg',
      m: 'text-xl',
      l: 'text-3xl',
      xl: 'text-4xl',
      '2xl': 'text-5xl',
      '4xl': 'text-6xl',
    },
  },
  defaultVariants: { size: 's' },
});

type AvatarSize = keyof typeof sizes;

type AvatarProps = {
  picture?: string | null;
  name?: string | null;
  size?: AvatarSize;
  square?: boolean;
  ring?: boolean;
  ringColor?: 'white' | 'primary';
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
  const styles = avatarStyles({ size, square, ring, ringColor, className });

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
  size: AvatarSize;
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

function AvatarColor({ name, size, className }: { name?: string | null; size: AvatarSize; className: string }) {
  const avatarName = name || 'Unknown';
  const gradient = generateGradientColor(avatarName);
  const initial = avatarName.charAt(0).toUpperCase();

  return (
    <div
      className={cx(
        'flex items-center justify-center font-medium text-gray-900/70',
        className,
        initialStyles({ size }),
      )}
      style={{ height: sizes[size], width: sizes[size], background: gradient }}
    >
      {initial}
    </div>
  );
}
