import c from 'classnames';
import { useSearchParams } from '@remix-run/react';
import { H1, Text } from '~/design-system/Typography';
import { IconButtonLink } from '~/design-system/IconButtons';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';

type Props = { proposal: { title: string }; current: number; total: number; className?: string };

export function TopPanel({ proposal, current, total, className }: Props) {
  const [searchParams] = useSearchParams();

  return (
    <div className={c('flex items-center justify-between border-b border-gray-200 bg-gray-50 py-8 px-8', className)}>
      <div>
        <IconButtonLink
          aria-label="Back to list"
          to={{ pathname: `..`, search: searchParams.toString() }}
          variant="secondary"
          size="l"
          icon={XMarkIcon}
        />
      </div>
      <div className="text-center">
        <H1>{proposal.title}</H1>
        <Text size="xs" className="mt-2">
          {current} / {total}
        </Text>
      </div>
      <div>
        <IconButtonLink
          aria-label="Edit proposal"
          to={{ pathname: `edit`, search: searchParams.toString() }}
          variant="secondary"
          size="l"
          icon={PencilSquareIcon}
        />
      </div>
    </div>
  );
}