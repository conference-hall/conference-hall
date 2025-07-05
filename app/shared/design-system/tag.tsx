import { Link, useParams, useSearchParams } from 'react-router';
import { getContrastColor } from '~/libs/colors/colors.ts';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';

type TagProps = { tag: TagType; isSearchLink?: boolean };

const styles =
  'inline-flex items-center text-nowrap px-2 py-0.5 text-xs font-semibold rounded-full text-white max-w-full';

export function Tag({ tag, isSearchLink = true }: TagProps) {
  if (isSearchLink) {
    return <TagLink tag={tag} />;
  }

  return (
    <div style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }} className={styles}>
      <span className="truncate">{tag.name}</span>
    </div>
  );
}

function TagLink({ tag }: TagProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const newSearchParams = new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), tags: tag.id });

  return (
    <Link
      to={{ pathname: `/team/${params.team}/${params.event}/reviews`, search: newSearchParams.toString() }}
      style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }}
      className={styles}
    >
      <span className="truncate">{tag.name}</span>
    </Link>
  );
}
