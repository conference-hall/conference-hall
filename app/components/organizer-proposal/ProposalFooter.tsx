import c from 'classnames';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { Button } from '~/design-system/Buttons';
import { RatingButtons } from './RatingButtons';

type Props = { className?: string };

export function ProposalFooter({ className }: Props) {
  return (
    <div className={c('flex items-center justify-between border-t border-gray-200 bg-gray-50 py-8 px-8', className)}>
      <div className="w-24">
        <Button variant="secondary" iconLeft={ChevronLeftIcon}>
          Previous
        </Button>
      </div>
      <RatingButtons />
      <div className="w-24">
        <Button variant="secondary" iconRight={ChevronRightIcon}>
          Next
        </Button>
      </div>
    </div>
  );
}
