import { cx } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { H1, H2, Subtitle } from '../typography.tsx';
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

type HeadingProps = { title: string; subtitle?: string; children?: ReactNode; level?: '1' | '2' };

function Heading({ title, subtitle, level = '1', children }: HeadingProps) {
  const HeadingTag = level === '1' ? H1 : H2;

  return (
    <div className="flex flex-col mb-8 gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="truncate min-w-0">
          <HeadingTag truncate>{title}</HeadingTag>
          {subtitle && <Subtitle truncate>{subtitle}</Subtitle>}
        </div>
      </div>

      {children && <div className="flex flex-col-reverse sm:items-center gap-4 sm:mt-0 sm:flex-row">{children}</div>}
    </div>
  );
}

Page.Heading = Heading;
