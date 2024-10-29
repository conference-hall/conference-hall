import { parseWithZod } from '@conform-to/zod';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { randUuid } from '@ngneat/falso';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';

import { Page } from '~/design-system/layouts/page.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Text } from '~/design-system/typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';
import { toast } from '~/libs/toasts/toast.server.ts';
import { TagModal } from '~/routes/__components/tags/tag-modal.tsx';
import { Tag } from '~/routes/__components/tags/tag.tsx';
import { EVENT_TAGS } from '~/types/tags.types.ts';

// TODO: Move in server
const TagSaveSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(50),
  color: z.string().trim().length(7),
});

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  // const searchParams = new URL(request.url).searchParams;
  // const result = parseWithZod(searchParams, { schema: z.object({ query: z.string().trim().optional() }) });
  // if (result.status !== 'success') return {};
  // const { query } = result.value;

  // TODO: do it in db
  return json(EVENT_TAGS);
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireSession(request);
  invariant(params.team, 'Invalid team slug');
  invariant(params.event, 'Invalid event slug');

  const form = await request.formData();
  const intent = form.get('intent');

  switch (intent) {
    case 'save-tag': {
      const result = parseWithZod(form, { schema: TagSaveSchema });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      // TODO: do it in db
      const index = EVENT_TAGS.findIndex((item) => item.id === result.value.id);
      if (index === -1) {
        EVENT_TAGS.push({ ...result.value, id: result.value.id || randUuid() });
      } else {
        EVENT_TAGS[index] = { ...result.value, id: result.value.id || randUuid() };
      }
      return toast('success', 'Tag saved.');
    }
    case 'delete-tag': {
      const result = parseWithZod(form, { schema: z.object({ id: z.string() }) });
      if (result.status !== 'success') return toast('error', 'Something went wrong.');
      // TODO: do it in db
      const index = EVENT_TAGS.findIndex((item) => item.id === result.value.id);
      if (index !== -1) EVENT_TAGS.splice(index, 1);
      return toast('success', 'Tag deleted.');
    }
  }

  return json(null);
};

// TODO: Add e2e tests
export default function TagsRoute() {
  const tags = useLoaderData<typeof loader>();

  return (
    <Page className="space-y-4">
      <h2 className="sr-only">Tags</h2>

      <div className="flex gap-4">
        <Form method="GET" className="w-full">
          <Input type="search" name="query" placeholder="Search tags" icon={MagnifyingGlassIcon} />
        </Form>
        <TagModal mode="create">{({ onOpen }) => <Button onClick={onOpen}>New tag</Button>}</TagModal>
      </div>

      <List>
        <List.Header>
          <Text weight="medium">{tags.length} tags</Text>
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
        </List.Content>
      </List>
    </Page>
  );
}
