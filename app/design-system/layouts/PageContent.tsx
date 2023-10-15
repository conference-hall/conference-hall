import { cx } from 'class-variance-authority';

import { Container } from './Container.tsx';

type Props = { children: React.ReactNode; className?: string };

export function PageContent({ children, className }: Props) {
  return <Container className={cx('gap-4 my-4 lg:gap-8 lg:my-8', className)}>{children}</Container>;
}
