import { ChevronLeftIcon, PencilSquareIcon } from '@heroicons/react/20/solid';
import { useParams, useSearchParams } from '@remix-run/react';
import { Button, ButtonLink } from '~/design-system/Buttons';
import c from 'classnames';
import Select from '~/design-system/forms/Select';
import { H1, Text } from '~/design-system/Typography';

type Props = { proposal: { title: string }; current: number; total: number; className?: string };

export function ProposalHeader({ proposal, current, total, className }: Props) {
  const { slug, eventSlug } = useParams();
  const [searchParams] = useSearchParams();

  return (
    <div className={c('flex items-center justify-between border-b border-gray-200 bg-gray-50 py-8 px-8', className)}>
      <div>
        <ButtonLink
          to={{ pathname: `/organizer/${slug}/${eventSlug}/proposals`, search: searchParams.toString() }}
          variant="secondary"
          iconLeft={ChevronLeftIcon}
        >
          Back to list
        </ButtonLink>
      </div>
      <div className="text-center">
        <H1>{proposal.title}</H1>
        <Text size="xs" className="mt-2">
          {current} / {total}
        </Text>
      </div>
      <div className="flex gap-4">
        <Select
          name="status"
          label="Status"
          options={[{ id: 'SUBMITTED', label: 'Submitted' }]}
          srOnly
          value="SUBMITTED"
        />
        <Button variant="secondary" iconLeft={PencilSquareIcon}>
          Edit
        </Button>
      </div>
    </div>
  );
}
