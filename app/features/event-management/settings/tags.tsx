import { parseWithZod } from '@conform-to/zod/v4';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/20/solid';
import { TagIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { List } from '~/design-system/list/list.tsx';
import { Pagination } from '~/design-system/list/pagination.tsx';
import { Tag } from '~/design-system/tag.tsx';
import { H2, Text } from '~/design-system/typography.tsx';
import { TagModal } from '~/features/event-management/settings/components/tag-modal.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import { i18n } from '~/shared/i18n/i18n.server.ts';
import { parseUrlPage } from '~/shared/pagination/pagination.ts';
import { toast } from '~/shared/toasts/toast.server.ts';
import type { Route } from './+types/tags.ts';
import { parseUrlFilters, TagDeleteSchema, TagSaveSchema } from './services/event-proposal-tags.schema.server.ts';
import { EventProposalTags } from './services/event-proposal-tags.server.ts';

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { userId } = await requireUserSession(request);
  const filters = parseUrlFilters(request.url);
  const page = parseUrlPage(request.url);
  const { count, tags, pagination } = await EventProposalTags.for(userId, params.team, params.event).list(
    filters,
    page,
  );
  return { count, tags, filters, pagination };
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const t = await i18n.getFixedT(request);
  const { userId } = await requireUserSession(request);
  const form = await request.formData();
  const intent = form.get('intent');
  const tags = EventProposalTags.for(userId, params.team, params.event);

  switch (intent) {
    case 'save-tag': {
      const result = parseWithZod(form, { schema: TagSaveSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await tags.save(result.value);
      return toast('success', t('event-management.settings.tags.feedbacks.saved'));
    }
    case 'delete-tag': {
      const result = parseWithZod(form, { schema: TagDeleteSchema });
      if (result.status !== 'success') return toast('error', t('error.global'));
      await tags.delete(result.value.id);
      return toast('success', t('event-management.settings.tags.feedbacks.deleted'));
    }
  }

  return null;
};

export default function ProposalTagsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { count, tags, filters, pagination } = loaderData;

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.tags.heading')}</H2>
      </Card.Title>

      <Card.Content>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Form method="GET" className="w-full">
            <Input
              type="search"
              name="query"
              aria-label={t('event-management.settings.tags.search')}
              placeholder={t('event-management.settings.tags.search')}
              defaultValue={filters.query}
              icon={MagnifyingGlassIcon}
            />
          </Form>
          <TagModal mode="create">
            {({ onOpen }) => (
              <Button onClick={onOpen} iconLeft={PlusIcon}>
                {t('event-management.settings.tags.new')}
              </Button>
            )}
          </TagModal>
        </div>

        <List>
          <List.Header>
            <Text weight="medium">{t('event-management.settings.tags.list.total', { count })}</Text>
          </List.Header>

          <List.Content aria-label={t('event-management.settings.tags.list.label')}>
            {tags.map((tag) => (
              <List.Row key={tag.id} className="p-4 flex justify-between">
                <Tag tag={tag} />

                <div className="flex gap-2">
                  <TagModal mode="edit" initialValues={tag}>
                    {({ onOpen }) => (
                      <Button variant="secondary" size="s" onClick={onOpen}>
                        {t('common.edit')}
                      </Button>
                    )}
                  </TagModal>

                  <Form
                    method="POST"
                    preventScrollReset
                    onSubmit={(event) => {
                      if (!confirm(t('event-management.settings.tags.confirm', { name: tag.name }))) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={tag.id} />
                    <Button type="submit" name="intent" value="delete-tag" variant="important" size="s">
                      {t('common.delete')}
                    </Button>
                  </Form>
                </div>
              </List.Row>
            ))}

            {tags.length === 0 ? (
              <EmptyState icon={TagIcon} label={t('event-management.settings.tags.list.empty')} noBorder />
            ) : null}
          </List.Content>
        </List>

        <div>
          <Pagination {...pagination} />
        </div>
      </Card.Content>
    </Card>
  );
}
