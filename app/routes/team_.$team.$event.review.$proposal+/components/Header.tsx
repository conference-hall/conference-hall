import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useParams, useSearchParams } from '@remix-run/react';

import { ButtonLink } from '~/design-system/Buttons';
import { IconButtonLink } from '~/design-system/IconButtons';
import { PageHeader } from '~/design-system/layouts/PageHeader';
import { H1, Text } from '~/design-system/Typography';

type Props = {
  title: string;
  pagination: { current: number; total: number; nextId?: string; previousId?: string };
  canEditProposal: boolean;
};

export function ReviewHeader({ title, pagination, canEditProposal }: Props) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { current, total, nextId, previousId } = pagination;

  const search = searchParams.toString();
  const previousPath = `/team/${params.team}/${params.event}/review/${previousId}`;
  const nextPath = `/team/${params.team}/${params.event}/review/${nextId}`;
  const closePath = `/team/${params.team}/${params.event}`;
  const editPath = `/team/${params.team}/${params.event}/review/${params.proposal}/edit`;

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
        <H1 truncate>{title}</H1>
      </div>

      <div className="flex items-center gap-8">
        {canEditProposal && (
          <ButtonLink to={{ pathname: editPath, search }} variant="secondary" iconLeft={PencilSquareIcon}>
            Edit
          </ButtonLink>
        )}

        <IconButtonLink
          to={{ pathname: closePath, search }}
          icon={XMarkIcon}
          label="Close review"
          variant="secondary"
        />
      </div>
    </PageHeader>
  );
}
