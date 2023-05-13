import c from 'classnames';
import { type ReactNode } from 'react';

import { Card } from './layouts/Card';
import { H1 } from './Typography';

type Props = {
  title?: string;
  children: ReactNode;
  variant?: 'light' | 'dark' | 'none';
  vertical?: boolean;
};

export const StoryBlock = ({ title, children, variant = 'light', vertical = false }: Props) => (
  <section className="mb-8">
    {title && (
      <H1 size="xl" mb={4}>
        {title}
      </H1>
    )}
    {variant === 'none' ? (
      children
    ) : (
      <Card p={8} variant={variant}>
        <div className={c('flex items-start gap-4', { 'flex-col': vertical })}>{children}</div>
      </Card>
    )}
  </section>
);
