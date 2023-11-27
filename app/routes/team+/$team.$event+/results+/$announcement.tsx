import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';

import { Button, ButtonLink } from '~/design-system/Buttons';
import { Checkbox } from '~/design-system/forms/Checkboxes';
import { Input } from '~/design-system/forms/Input';
import { PageContent } from '~/design-system/layouts/PageContent';
import { Pagination } from '~/design-system/Pagination';
import { H1, Text } from '~/design-system/Typography.tsx';
import { requireSession } from '~/libs/auth/session.ts';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireSession(request);
  return json(null);
};

export default function AcceptedProposalEmails() {
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
        <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            <li className="flex items-center justify-between px-4 py-4 sm:px-6">
              <div className="flex gap-4">
                <Checkbox />
                <Text weight="semibold" truncate>
                  3 accepted proposals
                </Text>
              </div>
              <div className="flex gap-4">
                <Button iconRight={ArrowRightIcon}>Publish for all proposals</Button>
              </div>
            </li>
            {['Le web et la typographie', 'Proposal2', 'Proposal3'].map((item) => (
              <li key={item} className="flex items-center gap-4 px-4 py-4 sm:px-6">
                <Checkbox />
                <div>
                  <Text weight="medium" truncate>
                    {item}
                  </Text>
                  <Text size="xs" variant="secondary">
                    by Benjamin Petetot
                  </Text>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <ButtonLink to="/" variant="secondary">
                Previous
              </ButtonLink>
              <ButtonLink to="/" variant="secondary">
                Next
              </ButtonLink>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">97</span> results
                </p>
              </div>
              <div>
                <Pagination current={1} total={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
