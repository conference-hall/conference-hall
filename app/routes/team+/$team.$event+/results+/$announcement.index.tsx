import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useMemo } from 'react';

import { Button, ButtonLink } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Input } from '~/design-system/forms/Input';
import { PageContent } from '~/design-system/layouts/PageContent';
import { List } from '~/design-system/list/List';
import { useListSelection } from '~/design-system/list/useCheckboxSelection';
import { H1, Text } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);

  const url = new URL(request.url);
  const page = url.searchParams.get('page');

  if (page === '2') {
    return json({
      proposals: [
        { id: '6', name: 'Web Performance', speakers: 'by Harry Roberts' },
        { id: '7', name: 'Web Performance', speakers: 'by Harry Roberts' },
        { id: '8', name: 'Web Performance', speakers: 'by Harry Roberts' },
        { id: '9', name: 'Web Performance', speakers: 'by Harry Roberts' },
      ],
      pagination: { current: 2, pages: 2, total: 9 },
    });
  }

  return json({
    proposals: [
      { id: '1', name: 'Le web et la typographie', speakers: 'by Benjamin Petetot' },
      { id: '2', name: 'Modern JavaScript', speakers: 'by Sarah Drasner' },
      { id: '3', name: 'React Best Practices', speakers: 'by Dan Abramov' },
      { id: '4', name: 'CSS Grid Layout', speakers: 'by Rachel Andrew' },
      { id: '5', name: 'Web Accessibility', speakers: 'by Léonie Watson' },
    ],
    pagination: { current: 1, pages: 2, total: 9 },
  });
};

export default function ResultsAnnouncementSelection() {
  const { proposals, pagination } = useLoaderData<typeof loader>();

  const ids = useMemo(() => proposals.map(({ id }) => id), [proposals]);
  const { selection, isSelected, toggle, ref } = useListSelection(ids, pagination.total);

  return (
    <PageContent className="flex flex-col">
      <H1>Accepted proposals announcement</H1>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            name="query"
            type="search"
            placeholder="Search for proposals"
            icon={MagnifyingGlassIcon}
            className="grow"
          />
          <Button variant="secondary">Reset</Button>
        </div>

        <List>
          <List.Header>
            <Checkbox ref={ref}>
              {selection.length ? `${selection.length} selected` : `${pagination.total} proposals`}
            </Checkbox>
            <ButtonLink to="publish" iconRight={ArrowRightIcon}>
              {selection.length > 0 ? `Publish for ${pagination.total} selected` : 'Publish for all'}
            </ButtonLink>
          </List.Header>

          <List.Content>
            {proposals.map((proposal) => (
              <List.Row key={proposal.id}>
                <Checkbox
                  aria-label="Select proposal"
                  checked={isSelected(proposal.id)}
                  onChange={toggle(proposal.id)}
                />
                <div>
                  <Text weight="medium" truncate>
                    {proposal.name}
                  </Text>
                  <Text size="xs" variant="secondary">
                    {proposal.speakers}
                  </Text>
                </div>
              </List.Row>
            ))}
          </List.Content>

          <List.PaginationFooter {...pagination} />
        </List>
      </div>
    </PageContent>
  );
}
