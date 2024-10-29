import { Link, useParams, useSearchParams } from '@remix-run/react';
import { getContrastColor } from '~/libs/colors/colors.ts';
import type { Tag as TagType } from '~/types/tags.types.ts';

type TagProps = { tag: TagType };

// TODO: Add tests
export function Tag({ tag }: TagProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const newSearchParams = new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), tags: tag.id });

  return (
    <Link
      to={{ pathname: `/team/${params.team}/${params.event}/reviews`, search: newSearchParams.toString() }}
      className="inline-flex items-center text-nowrap px-2 py-0.5 text-xs font-semibold rounded-full text-white max-w-full"
      style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }}
    >
      <span className="truncate">{tag.name}</span>
    </Link>
  );
}
