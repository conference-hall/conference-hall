import { parseWithZod } from '@conform-to/zod';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/20/solid';
import { TagIcon } from '@heroicons/react/24/outline';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { EventProposalTags } from '~/.server/event-settings/event-proposal-tags.ts';
import { TagDeleteSchema, TagSaveSchema, parseUrlFilters } from '~/.server/event-settings/event-proposal-tags.types.ts';
import { parseUrlPage } from '~/.server/shared/pagination.ts';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';

import { List } from '~/design-system/list/list.tsx';
import { Pagination } from '~/design-system/list/pagination.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { TagModal } from '~/routes/__components/tags/tag-modal.tsx';
import { Tag } from '~/routes/__components/tags/tag.tsx';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const { count, tags, pagination } = await EventProposalTags.for(userId, params.team, params.event).list(
    filters,
    page,
  );

  return json({ count, tags, filters, pagination });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const intent = form.get('intent');

  const tags = EventProposalTags.for(userId, params.team, params.event);

  switch (intent) {
    case 'save-tag': {
      const result = parseWithZod(form, { schema: TagSaveSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await tags.save(result.value);
      return toast('success', 'Tag saved.');
    }
    case 'delete-tag': {
      const result = parseWithZod(form, { schema: TagDeleteSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      await tags.delete(result.value.id);
      return toast('success', 'Tag deleted.');
    }
  }

  return null;
};

// TODO: [tags] Add e2e tests
export default function ProposalTagsRoute() {
  const { count, tags, filters, pagination } = useLoaderData<typeof loader>();

  return (
    <Card as="section">
      <Card.Title>
        <H2>Proposal tags</H2>
      </Card.Title>

      <Card.Content>
        <div className="flex gap-4">
          <Form method="GET" className="w-full">
            <Input
              type="search"
              name="query"
              aria-label="Search tags"
              placeholder="Search tags"
              defaultValue={filters.query}
              icon={MagnifyingGlassIcon}
            />
          </Form>
          <TagModal mode="create">
            {({ onOpen }) => (
              <Button onClick={onOpen} iconLeft={PlusIcon}>
                New tag
              </Button>
            )}
          </TagModal>
        </div>

        <List>
          <List.Header>
            <Text weight="medium">{count} tags</Text>
          </List.Header>

          <List.Content>
            {tags.map((tag) => (
              <List.Row key={tag.id} className="p-4 flex justify-between">
                <Tag tag={tag} />

                <div className="flex gap-2">
                  <TagModal mode="edit" initialValues={tag}>
                    {({ onOpen }) => (
                      <Button variant="secondary" size="s" onClick={onOpen}>
                        Edit
                      </Button>
                    )}
                  </TagModal>

                  <Form
                    method="POST"
                    preventScrollReset
                    onSubmit={(event) => {
                      if (!confirm(`Are you sure you want to delete the "${tag.name}" tag?`)) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={tag.id} />
                    <Button type="submit" name="intent" value="delete-tag" variant="important" size="s">
                      Delete
                    </Button>
                  </Form>
                </div>
              </List.Row>
            ))}

            {tags.length === 0 ? <EmptyState icon={TagIcon} label="No tags to display." noBorder /> : null}
          </List.Content>
        </List>

        <div>
          <Pagination {...pagination} />
        </div>
      </Card.Content>
    </Card>
  );
}
