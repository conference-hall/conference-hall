import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { TagSelect } from '~/routes/__components/tags/tag-select.tsx';
import { Tag } from '~/routes/__components/tags/tag.tsx';
import { EVENT_TAGS } from '~/types/tags.types.ts';

const PROPOSAL_TAGS = ['tag-1', 'tag-2', 'tag-8', 'tag-4'];

// TODO: Optimistic rendering
export function TagsCard() {
  const [tags, setTags] = useState(EVENT_TAGS.filter((t) => PROPOSAL_TAGS.includes(t.id)));

  return (
    <Card as="section" className="p-4 lg:p-6">
      <TagSelect tags={EVENT_TAGS} defaultValues={tags} onChange={setTags}>
        <div className="flex items-center justify-between group">
          <H2 size="s" className="group-hover:text-indigo-600">
            Tags
          </H2>
          <Cog6ToothIcon className="h-5 w-5 text-gray-500 group-hover:text-indigo-600" role="presentation" />
        </div>
      </TagSelect>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.length === 0 ? <Text size="xs">No tags yet.</Text> : null}

        {tags.map((tag) => (
          <Tag key={tag.id} tag={tag} />
        ))}
      </div>
    </Card>
  );
}
