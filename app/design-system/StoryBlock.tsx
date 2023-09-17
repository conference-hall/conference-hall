import { cx } from 'class-variance-authority';
import { type ReactNode } from 'react';

import { Card } from './layouts/Card.tsx';
import { H1 } from './Typography.tsx';

type Props = {
  title?: string;
  children: ReactNode;
  variant?: 'light' | 'dark' | 'none';
  vertical?: boolean;
};

export const StoryBlock = ({ title, children, variant = 'light', vertical = false }: Props) => (
  <section className="mb-8">
    {title && <H1 mb={4}>{title}</H1>}
    {variant === 'none' ? (
      children
    ) : (
      <Card p={8} variant={variant}>
        <div className={cx('flex items-start gap-4', { 'flex-col': vertical })}>{children}</div>
      </Card>
    )}
  </section>
);
