import React from 'react';
import cn from 'classnames';

type SectionPanelProps = {
  id: string;
  title: string;
  padding?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function SectionPanel({ id, title, children, padding, className }: SectionPanelProps) {
  const styles = cn('bg-white border border-gray-200 overflow-hidden sm:rounded-lg', { 'px-4 py-5 sm:px-6': padding }, className);
  return (
    <section aria-labelledby={id} className={styles}>
      <h2 className="sr-only" id={id}>
        {title}
      </h2>
      {children}
    </section>
  );
}
