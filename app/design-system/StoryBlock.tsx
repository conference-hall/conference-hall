import { type ReactNode } from 'react';
import c from 'classnames';
import { H1 } from './Typography';

type Props = {
  title: string;
  children: ReactNode;
  vertical?: boolean;
};

export const StoryBlock = ({ title, children, vertical = false }: Props) => (
  <section>
    <H1>{title}</H1>
    <div className={c('my-8 flex items-start gap-4', { 'flex-col': vertical })}>{children}</div>
  </section>
);
