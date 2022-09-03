import c from 'classnames';

const sizes = { s: 'h-6 w-6', base: 'h-8 w-8', l: 'h-16 w-16', xl: 'h-20 w-20' };
const rings = { s: 'ring-2', base: 'ring-2', l: 'ring-4', xl: 'ring-4' };
const ringsColor = { white: 'ring-white', primary: 'ring-indigo-500' };

type AvatarProps = {
  photoURL?: string | null;
  alt?: string | null;
  size?: keyof typeof sizes;
  ring?: boolean;
  ringColor?: keyof typeof ringsColor;
  className?: string;
};

export function Avatar({ photoURL, alt, size = 'base', ring = false, ringColor = 'primary', className }: AvatarProps) {
  const styles = c(
    'mx-auto rounded-full',
    sizes[size],
    ring ? rings[size] : null,
    ring ? ringsColor[ringColor] : null,
    className
  );
  return (
    <img className={styles} src={photoURL || 'http://placekitten.com/100/100'} alt={alt || ''} aria-hidden={!alt} />
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
          size="s"
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
