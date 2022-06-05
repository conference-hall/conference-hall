import cn from 'classnames';
import { NavLink } from '@remix-run/react';
import { CfpState } from '../utils/event';
import { Container } from '../components-ui/Container';

type Props = {
  slug: string;
  type: 'CONFERENCE' | 'MEETUP';
  cfpState: CfpState;
  surveyEnabled: boolean;
};

export function EventTabs({ slug, type, cfpState, surveyEnabled }: Props) {
  return (
    <div className="sticky top-0 z-10 pt-4 border-b bg-white border-gray-200">
      <Container>
        <nav className="-mb-px flex space-x-8">
          <NavLink to={`/${slug}`} end className={activeTab}>
            {type === 'CONFERENCE' ? 'Conference' : 'Meetup'}
          </NavLink>
          <NavLink to={`/${slug}/proposals`} className={activeTab}>
            Your proposals
          </NavLink>
          {surveyEnabled && (
            <NavLink to={`/${slug}/survey`} className={activeTab}>
              Survey
            </NavLink>
          )}
          {cfpState === 'OPENED' && (
            <NavLink to={`/${slug}/submission`} className={activeTab}>
              Submit a proposal
            </NavLink>
          )}
        </nav>
      </Container>
    </div>
  );
}

const activeTab = ({ isActive }: { isActive: boolean }) => {
  return cn('whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm', {
    'border-indigo-500 text-indigo-600': isActive,
    'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': !isActive,
  });
};
