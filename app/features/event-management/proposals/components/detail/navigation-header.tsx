import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid';
import { useHotkey } from '@tanstack/react-hotkeys';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { href, useNavigate, useSearchParams } from 'react-router';
import { Button } from '~/design-system/button.tsx';
import { Text } from '~/design-system/typography.tsx';
import { ReviewsProgress } from '../shared/reviews-progress.tsx';

type Props = {
  team: string;
  event: string;
  current: number;
  total: number;
  reviewed: number;
  next?: string;
  previous?: string;
  pageRef: React.RefObject<HTMLElement | null>;
};

function isFocusedOutsidePage(pageRef: React.RefObject<HTMLElement | null>): boolean {
  const active = document.activeElement;
  return !!active && active !== document.body && !pageRef.current?.contains(active);
}

export function NavigationHeader({ team, event, current, total, reviewed, next, previous, pageRef }: Props) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const previousPath = previous
    ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: previous })
    : undefined;

  const nextPath = next ? href('/team/:team/:event/proposals/:proposal', { team, event, proposal: next }) : undefined;

  useHotkey(
    'N',
    () => {
      if (isFocusedOutsidePage(pageRef)) return;
      navigate({ pathname: nextPath, search: searchParams.toString() });
    },
    { enabled: !!nextPath },
  );

  useHotkey(
    'P',
    () => {
      if (isFocusedOutsidePage(pageRef)) return;
      navigate({ pathname: previousPath, search: searchParams.toString() });
    },
    { enabled: !!previousPath },
  );

  return (
    <header className="flex items-center justify-between gap-4 pb-4 lg:-mt-4">
      <nav className="flex grow items-center justify-between gap-2 sm:justify-start lg:gap-4">
        <Button
          to={{ pathname: previousPath, search: searchParams.toString() }}
          icon={ChevronLeftIcon}
          label={t('event-management.proposal-page.previous')}
          variant="secondary"
          size="sm"
          disabled={!previousPath}
        />
        <Text weight="medium">{`${current}/${total}`}</Text>
        <Button
          to={{ pathname: nextPath, search: searchParams.toString() }}
          icon={ChevronRightIcon}
          label={t('event-management.proposal-page.next')}
          variant="secondary"
          size="sm"
          disabled={!nextPath}
        />
      </nav>

      <div className="flex items-center gap-8">
        <ReviewsProgress reviewed={reviewed} total={total} />
      </div>
    </header>
  );
}
