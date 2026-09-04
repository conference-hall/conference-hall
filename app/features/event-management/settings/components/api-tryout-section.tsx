import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '~/design-system/badges.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { CodeBlock } from '~/design-system/code-block.tsx';
import { CodeExamples } from '~/design-system/code-examples.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import Select from '~/design-system/forms/select.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { TableBuilder, type TableBuilderRow } from '~/design-system/table.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import {
  ConfirmationFilterSchema,
  OrderFilterSchema,
  SortFilterSchema,
  StatusFilterSchema,
} from '~/features/event-management/proposals/services/proposal-search-builder.schema.ts';

type Track = { id: string; name: string };

type ProposalsProps = {
  slug: string;
  apiKey: string;
  appUrl: string;
  formats: Array<Track>;
  categories: Array<Track>;
  tags: Array<Track>;
  responseExample?: string | null;
};

type ScheduleProps = { slug: string; apiKey: string; appUrl: string; responseExample?: string | null };

type ParameterRow = { name: string; values: string; description: string };
type StatusRow = { code: string; description: string };

export function EventProposalApiTryout({
  slug,
  apiKey,
  appUrl,
  formats,
  categories,
  tags,
  responseExample,
}: ProposalsProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [format, setFormat] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('');
  const [order, setOrder] = useState('');

  const url = new URL(`/api/v1/event/${slug}`, appUrl);
  if (query) url.searchParams.set('query', query);
  if (status) url.searchParams.set('status', status);
  if (confirmation) url.searchParams.set('confirmation', confirmation);
  if (format) url.searchParams.set('formats', format);
  if (category) url.searchParams.set('categories', category);
  if (tag) url.searchParams.set('tags', tag);
  if (sort) url.searchParams.set('sort', sort);
  if (order) url.searchParams.set('order', order);

  const allOption = { value: '', name: t('common.all') };

  // Enum values are derived from the proposals filter schema (single source of truth).
  const parameters: Array<ParameterRow> = [
    { name: 'query', values: 'string', description: t('event-management.settings.web-api.reference.params.query') },
    {
      name: 'status',
      values: StatusFilterSchema.options.join(' | '),
      description: t('event-management.settings.web-api.reference.params.status'),
    },
    {
      name: 'confirmation',
      values: ConfirmationFilterSchema.options.join(' | '),
      description: t('event-management.settings.web-api.reference.params.confirmation'),
    },
    { name: 'formats', values: 'id', description: t('event-management.settings.web-api.reference.params.formats') },
    {
      name: 'categories',
      values: 'id',
      description: t('event-management.settings.web-api.reference.params.categories'),
    },
    { name: 'tags', values: 'id', description: t('event-management.settings.web-api.reference.params.tags') },
    {
      name: 'sort',
      values: SortFilterSchema.options.join(' | '),
      description: t('event-management.settings.web-api.reference.params.sort'),
    },
    {
      name: 'order',
      values: OrderFilterSchema.options.join(' | '),
      description: t('event-management.settings.web-api.reference.params.order'),
    },
  ];
  const statusRows: Array<StatusRow> = [
    { code: '200', description: t('event-management.settings.web-api.status.proposals.200') },
    { code: '400', description: t('event-management.settings.web-api.status.proposals.400') },
    { code: '403', description: t('event-management.settings.web-api.status.proposals.403') },
    { code: '404', description: t('event-management.settings.web-api.status.proposals.404') },
    { code: '429', description: t('event-management.settings.web-api.status.proposals.429') },
  ];

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <H2>{t('event-management.settings.web-api.tryout.proposals.heading')}</H2>
        <Subtitle>{t('event-management.settings.web-api.tryout.proposals.description')}</Subtitle>
        <EndpointHeader path={`/api/v1/event/${slug}`} />
      </div>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.web-api.tryout.filters.heading')}</H2>
        </Card.Title>
        <Card.Content>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="query"
              label={t('event-management.settings.web-api.tryout.proposals.query.label')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('event-management.settings.web-api.tryout.proposals.query.placeholder')}
              className="sm:col-span-2"
            />
            <Select
              name="status"
              label={t('event-management.settings.web-api.tryout.proposals.status.label')}
              value={status}
              onChange={(_, value) => setStatus(value)}
              options={[
                allOption,
                ...StatusFilterSchema.options.map((value) => ({
                  value,
                  name: t(`common.proposals.status.${value}`),
                })),
              ]}
            />
            <Select
              name="confirmation"
              label={t('event-management.settings.web-api.tryout.proposals.confirmation.label')}
              value={confirmation}
              onChange={(_, value) => setConfirmation(value)}
              options={[
                allOption,
                ...ConfirmationFilterSchema.options.map((value) => ({
                  value,
                  name: t(`common.proposals.status.${value}.short`),
                })),
              ]}
            />
            {formats.length > 0 ? (
              <Select
                name="formats"
                label={t('event-management.settings.web-api.tryout.proposals.format.label')}
                value={format}
                onChange={(_, value) => setFormat(value)}
                options={[allOption, ...formats.map((f) => ({ value: f.id, name: f.name }))]}
              />
            ) : null}
            {categories.length > 0 ? (
              <Select
                name="categories"
                label={t('event-management.settings.web-api.tryout.proposals.category.label')}
                value={category}
                onChange={(_, value) => setCategory(value)}
                options={[allOption, ...categories.map((c) => ({ value: c.id, name: c.name }))]}
              />
            ) : null}
            {tags.length > 0 ? (
              <Select
                name="tags"
                label={t('event-management.settings.web-api.tryout.proposals.tag.label')}
                value={tag}
                onChange={(_, value) => setTag(value)}
                options={[allOption, ...tags.map((tg) => ({ value: tg.id, name: tg.name }))]}
              />
            ) : null}
            <Select
              name="sort"
              label={t('event-management.settings.web-api.tryout.proposals.sort.label')}
              value={sort}
              onChange={(_, value) => setSort(value)}
              options={[allOption, ...SortFilterSchema.options.map((value) => ({ value, name: value }))]}
            />
            <Select
              name="order"
              label={t('event-management.settings.web-api.tryout.proposals.order.label')}
              value={order}
              onChange={(_, value) => setOrder(value)}
              options={[allOption, ...OrderFilterSchema.options.map((value) => ({ value, name: value }))]}
            />
          </div>
        </Card.Content>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.web-api.examples.heading')}</H2>
        </Card.Title>
        <Card.Content>
          <ApiCodeExamples url={url.toString()} apiKey={apiKey} />
        </Card.Content>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.web-api.reference.heading')}</H2>
        </Card.Title>
        <Card.Content>
          <ParametersTable rows={parameters} />
        </Card.Content>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.web-api.status.heading')}</H2>
        </Card.Title>
        <Card.Content>
          <HttpStatusTable rows={statusRows} />
        </Card.Content>
      </Card>

      {responseExample ? (
        <Card as="section">
          <Card.Title>
            <H2>{t('event-management.settings.web-api.reference.response')}</H2>
          </Card.Title>
          <Card.Content>
            <CodeBlock code={responseExample} />
          </Card.Content>
        </Card>
      ) : null}
    </section>
  );
}

export function EventScheduleApiTryout({ slug, apiKey, appUrl, responseExample }: ScheduleProps) {
  const { t } = useTranslation();
  const url = new URL(`/api/v1/event/${slug}/schedule`, appUrl);
  const statusRows: Array<StatusRow> = [
    { code: '200', description: t('event-management.settings.web-api.status.schedule.200') },
    { code: '400', description: t('event-management.settings.web-api.status.schedule.400') },
    { code: '403', description: t('event-management.settings.web-api.status.schedule.403') },
    { code: '404', description: t('event-management.settings.web-api.status.schedule.404') },
    { code: '429', description: t('event-management.settings.web-api.status.schedule.429') },
  ];

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <H2>{t('event-management.settings.web-api.tryout.schedule.heading')}</H2>
        <Subtitle>{t('event-management.settings.web-api.tryout.schedule.description')}</Subtitle>
        <EndpointHeader path={`/api/v1/event/${slug}/schedule`} />
      </div>

      <Callout>{t('event-management.settings.web-api.tryout.schedule.availability')}</Callout>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.web-api.examples.heading')}</H2>
        </Card.Title>
        <Card.Content>
          <ApiCodeExamples url={url.toString()} apiKey={apiKey} />
        </Card.Content>
      </Card>

      <Card as="section">
        <Card.Title>
          <H2>{t('event-management.settings.web-api.status.heading')}</H2>
        </Card.Title>
        <Card.Content>
          <HttpStatusTable rows={statusRows} />
        </Card.Content>
      </Card>

      {responseExample ? (
        <Card as="section">
          <Card.Title>
            <H2>{t('event-management.settings.web-api.reference.response')}</H2>
          </Card.Title>
          <Card.Content>
            <CodeBlock code={responseExample} />
          </Card.Content>
        </Card>
      ) : null}
    </section>
  );
}

function EndpointHeader({ path }: { path: string }) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <Badge color="green">GET</Badge>
      <code className="overflow-x-auto rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-900">{path}</code>
    </div>
  );
}

function ApiCodeExamples({ url, apiKey }: { url: string; apiKey: string }) {
  const { t } = useTranslation();

  return (
    <CodeExamples
      examples={[
        {
          id: 'curl',
          label: t('event-management.settings.web-api.examples.curl'),
          code: `curl -H "X-API-Key: ${apiKey}" "${url}"`,
        },
        {
          id: 'fetch',
          label: t('event-management.settings.web-api.examples.fetch'),
          code: `const response = await fetch("${url}", {
  headers: { "X-API-Key": "${apiKey}" },
});
const data = await response.json();`,
        },
      ]}
    />
  );
}

function ParametersTable({ rows }: { rows: Array<ParameterRow> }) {
  const { t } = useTranslation();
  const tableRows: Array<TableBuilderRow> = rows.map((row) => ({
    key: row.name,
    cells: [
      { value: row.name, className: 'font-mono text-gray-900' },
      { value: row.values, className: 'font-mono text-gray-500' },
      { value: row.description, className: 'text-gray-600' },
    ],
  }));

  return (
    <TableBuilder
      headers={[
        t('event-management.settings.web-api.reference.parameter'),
        t('event-management.settings.web-api.reference.values'),
        t('event-management.settings.web-api.reference.description'),
      ]}
      rows={tableRows}
    />
  );
}

function HttpStatusTable({ rows }: { rows: Array<StatusRow> }) {
  const { t } = useTranslation();
  const tableRows: Array<TableBuilderRow> = rows.map((row) => ({
    key: `${row.code}-${row.description}`,
    cells: [
      { value: row.code, className: 'font-mono text-gray-900' },
      { value: row.description, className: 'text-gray-600' },
    ],
  }));

  return (
    <TableBuilder
      headers={[
        t('event-management.settings.web-api.status.code'),
        t('event-management.settings.web-api.status.description'),
      ]}
      rows={tableRows}
    />
  );
}
