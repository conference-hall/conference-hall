import type { ReactNode } from 'react';
import { cx } from 'class-variance-authority';
import { H1, Subtitle } from '../typography.tsx';
import { Container } from './container.tsx';

type Props = { children: React.ReactNode; className?: string };

export function Page({ children, className }: Props) {
  return (
    <Container as="main" className={cx('my-4 gap-4 lg:my-8 lg:gap-8', className)}>
      {children}
    </Container>
  );
}

type NavHeaderProps = { children?: ReactNode; className?: string };

function NavHeader({ className, children }: NavHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
      <div className={cx('mx-auto max-w-7xl px-0 lg:px-8', className)}>{children}</div>
    </div>
  );
}

Page.NavHeader = NavHeader;

type HeadingProps = {
  title?: string;
  subtitle?: string;
  component?: ReactNode;
  children?: ReactNode;
};

function Heading({ title, subtitle, component, children }: HeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <div className="min-w-0">
          {component ? (
            component
          ) : (
            <>
              <H1>{title}</H1>
              {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </>
          )}
        </div>
      </div>

      {children && <div className="flex flex-col-reverse gap-4 sm:mt-0 sm:flex-row sm:items-center">{children}</div>}
    </div>
  );
}

Page.Heading = Heading;
