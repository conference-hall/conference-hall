import { getContrastColor } from '~/libs/colors/colors.ts';
import type { Tag as TagType } from '~/types/tags.types.ts';

type TagProps = { tag: Omit<TagType, 'id'> };

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
