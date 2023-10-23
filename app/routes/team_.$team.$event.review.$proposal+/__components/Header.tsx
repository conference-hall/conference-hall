import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams, useSearchParams } from '@remix-run/react';
import { useHotkeys } from 'react-hotkeys-hook';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { IconButtonLink } from '~/design-system/IconButtons.tsx';
import { PageHeader } from '~/design-system/layouts/PageHeader.tsx';
import { H1, Text } from '~/design-system/Typography.tsx';

type Props = {
  title: string;
  pagination: { current: number; total: number; nextId?: string; previousId?: string };
  canEditProposal: boolean;
};

export function ReviewHeader({ title, pagination, canEditProposal }: Props) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const search = searchParams.toString();
  const { current, total, nextId, previousId } = pagination;

  const previousPath =
    previousId !== undefined ? `/team/${params.team}/${params.event}/review/${previousId}` : undefined;
  const nextPath = nextId !== undefined ? `/team/${params.team}/${params.event}/review/${nextId}` : undefined;
  const editPath = `/team/${params.team}/${params.event}/review/${params.proposal}/edit`;
  const closePath = `/team/${params.team}/${params.event}`;

  useHotkeys('left', () => navigate({ pathname: previousPath, search }), { enabled: !!previousPath });
  useHotkeys('right', () => navigate({ pathname: nextPath, search }), { enabled: !!nextPath });
  useHotkeys('escape', () => navigate({ pathname: closePath, search }));

  return (
    <PageHeader as="header" className="flex items-center gap-4 lg:gap-8 p-4 lg:p-8">
      <nav className="flex items-center gap-4">
        <IconButtonLink
          to={{ pathname: previousPath, search }}
          icon={ChevronLeftIcon}
          label="Previous proposal"
          variant="secondary"
          aria-disabled={!previousPath}
        />
        <Text weight="medium">{`${current}/${total}`}</Text>
        <IconButtonLink
          to={{ pathname: nextPath, search }}
          icon={ChevronRightIcon}
          label="Next proposal"
          variant="secondary"
          aria-disabled={!nextPath}
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
