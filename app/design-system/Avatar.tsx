import c from 'classnames';

const sizes = { xs: 'h-6 w-6', s: 'h-8 w-8', m: 'h-12 w-12', l: 'h-16 w-16', xl: 'h-20 w-20' };
const rings = { xs: 'ring-2', s: 'ring-2', m: 'ring-2', l: 'ring-4', xl: 'ring-4' };
const ringsColor = { white: 'ring-white', primary: 'ring-indigo-500' };

type AvatarProps = {
  photoURL?: string | null;
  alt?: string | null;
  size?: keyof typeof sizes;
  ring?: boolean;
  ringColor?: keyof typeof ringsColor;
  className?: string;
};

export function Avatar({ photoURL, alt, size = 's', ring = false, ringColor = 'primary', className }: AvatarProps) {
  const styles = c(
    'shrink-0 rounded-full bg-gray-200',
    sizes[size],
    ring ? rings[size] : null,
    ring ? ringsColor[ringColor] : null,
    className
  );
  return (
    <img
      className={styles}
      src={photoURL || 'http://via.placeholder.com/100x100'}
      alt={alt || ''}
      aria-hidden={!alt}
      loading="lazy"
    />
  );
}

type AvatarGroupProps = {
  avatars: Array<{ photoURL?: string | null; name?: string | null }>;
  size?: keyof typeof sizes;
  ring?: boolean;
  ringColor?: keyof typeof ringsColor;
  displayNames?: boolean;
  className?: string;
};

export function AvatarGroup({ avatars, displayNames = false, className }: AvatarGroupProps) {
  return (
    <div className={c('-space-x-1 overflow-hidden', className)}>
      {avatars.map((avatar) => (
        <Avatar
          key={avatar.name}
          photoURL={avatar.photoURL}
          alt={avatar.name}
          size="xs"
          ring
          ringColor="white"
          className="inline-block"
        />
      ))}
      {displayNames && (
        <span className="test-gray-500 truncate pl-3 text-sm">by {avatars.map((a) => a.name).join(', ')}</span>
      )}
    </div>
  );
}

type AvatarNameProps = { name?: string | null; subtitle?: string | null } & AvatarProps;

export function AvatarName({ name, subtitle, className, ...rest }: AvatarNameProps) {
  return (
    <div className="flex items-center">
      <Avatar {...rest} />
      <div className="ml-3 text-left">
        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{name || 'Unknown'}</p>
        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">{subtitle}</p>
      </div>
    </div>
  );
}
