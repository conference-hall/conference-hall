import { ButtonLink } from '../../../../components/Buttons';
import { CfpLabel } from '../../../../components/event/CfpInfo';
import { Container } from '../../../../components/layout/Container';
import { CfpState } from '../../../../utils/event';

type ProposalEmptyStateProps = { cfpState: CfpState };

export function ProposalsEmptyState({ cfpState }: ProposalEmptyStateProps) {
  return (
    <Container className="mt-8 py-8 flex flex-col items-center">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      {cfpState === 'OPENED' ? (
        <>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No submitted proposals yet!</h3>
          <p className="mt-1 text-sm text-gray-600">Get started by submitting your first proposal.</p>
          <div className="mt-12">
            <ButtonLink to="../submission">Submit a proposal</ButtonLink>
          </div>
        </>
      ) : (
        <>
          <p className="mt-4">
            <CfpLabel cfpState={cfpState} />
          </p>
        </>
      )}
    </Container>
  );
}
