import type { Tag as TagType } from '~/types/tags.types.ts';

type TagProps = { tag: TagType };

export function Tag({ tag }: TagProps) {
  return (
    <div
      className="inline-flex items-center text-nowrap px-2 py-0.5 text-xs font-semibold rounded-full text-white max-w-full"
      style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }}
    >
      <span className="truncate">{tag.name}</span>
    </div>
  );
}

function getContrastColor(hex: string) {
  const rgb = Number.parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luminance > 158 ? '#000000' : '#ffffff';
}
