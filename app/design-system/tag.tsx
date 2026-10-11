import { Link, useParams, useSearchParams } from 'react-router';
import type { Tag as TagType } from '~/shared/types/tags.types.ts';
import { Badge } from './badges.tsx';

type TagProps = { tag: TagType; isSearchLink?: boolean };

export function Tag({ tag, isSearchLink = true }: TagProps) {
  if (isSearchLink) {
    return <TagLink tag={tag} />;
  }

  return <TagBadge tag={tag} />;
}

function TagBadge({ tag }: { tag: TagType }) {
  return (
    <Badge hexColor={tag.color} pill>
      <span className="truncate">{tag.name}</span>
    </Badge>
  );
}

function TagLink({ tag }: TagProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const newSearchParams = new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), tags: tag.id });

  return (
    <Link
      to={{ pathname: `/team/${params.team}/${params.event}/proposals`, search: newSearchParams.toString() }}
      className="inline-flex max-w-full rounded-full focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600"
    >
      <TagBadge tag={tag} />
    </Link>
  );
}
