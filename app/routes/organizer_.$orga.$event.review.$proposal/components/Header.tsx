import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useParams, useSearchParams } from '@remix-run/react';
import { IconButtonLink } from '~/design-system/IconButtons';
import { H1, Text } from '~/design-system/Typography';
import { PageHeader } from '~/design-system/layouts/PageHeader';

type Props = {
  title: string;
  pagination: { current: number; total: number; nextId?: string; previousId?: string };
};

export function ReviewHeader({ title, pagination }: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { current, total, nextId, previousId } = pagination;

  const search = searchParams.toString();
  const previousPath = `/organizer/${params.orga}/${params.event}/review/${previousId}`;
  const nextPath = `/organizer/${params.orga}/${params.event}/review/${nextId}`;
  const closePath = `/organizer/${params.orga}/${params.event}`;

  return (
    <PageHeader as="header" className="flex items-center gap-8 px-8 py-8">
      <nav className="flex items-center gap-4">
        <IconButtonLink
          to={{ pathname: previousPath, search }}
          icon={ChevronLeftIcon}
          label="Previous proposal"
          variant="secondary"
        />
        <Text strong heading>
          {`${current}/${total}`}
        </Text>
        <IconButtonLink
          to={{ pathname: nextPath, search }}
          icon={ChevronRightIcon}
          label="Next proposal"
          variant="secondary"
        />
      </nav>

      <div className="grow truncate">
        <H1 size="xl" truncate>
          {title}
        </H1>
      </div>

      <IconButtonLink to={{ pathname: closePath, search }} icon={XMarkIcon} label="Close review" variant="secondary" />
    </PageHeader>
  );
}
