import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';
import { ButtonLink } from '../buttons.tsx';
import { H1, Subtitle } from '../typography.tsx';
import { Container } from './container.tsx';

type Props = { children: React.ReactNode; className?: string };

export function Page({ children, className }: Props) {
  return (
    <Container as="main" className={cx('gap-4 my-4 lg:gap-8 lg:my-8', className)}>
      {children}
    </Container>
  );
}

type NavHeaderProps = { children?: ReactNode; className?: string };

function NavHeader({ className, children }: NavHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
      <Container className={className}>{children}</Container>
    </div>
  );
}

Page.NavHeader = NavHeader;

type HeadingProps = { title: string; subtitle?: string; backTo?: string; children?: ReactNode };

function Heading({ title, subtitle, children, backTo }: HeadingProps) {
  return (
    <div className="flex flex-col mb-8 gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {backTo ? (
          <ButtonLink size="square-m" variant="secondary" to={backTo} className="mr-2">
            <ArrowLeftIcon className="h-5 w-5" />
          </ButtonLink>
        ) : null}

        <div className="truncate min-w-0">
          <H1 truncate>{title}</H1>
          {subtitle && <Subtitle truncate>{subtitle}</Subtitle>}
        </div>
      </div>

      {children && <div className="flex flex-col-reverse sm:items-center gap-4 sm:mt-0 sm:flex-row">{children}</div>}
    </div>
  );
}

Page.Heading = Heading;
