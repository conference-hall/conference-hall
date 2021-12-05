import { ReactNode } from 'react';

type HeadingProps = {
  children: ReactNode;
  description?: string;
  className?: string;
};

export function Heading({ children, description, className }: HeadingProps) {
  return (
    <div className={className}>
      <h3 className="text-lg leading-6 font-medium text-gray-900">{children}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
}
