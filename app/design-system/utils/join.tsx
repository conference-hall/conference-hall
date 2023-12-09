import React from 'react';

type Props = { separator: React.ReactNode; children: React.ReactNode[] };

export function Join({ separator, children }: Props) {
  return children.filter(Boolean).map((child, index) => (
    <React.Fragment key={index}>
      {!!index && separator}
      {child}
    </React.Fragment>
  ));
}
