import { Children, cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

type JoinProps = {
  children: ReactNode;
  by: ReactNode;
};

/**
 * Renders its children with the `by` separator inserted between each of them,
 * like `String.prototype.join` but for React nodes.
 *
 * `React.Children.toArray` filters out `null`, `false` and `undefined` children,
 * so conditional pieces don't leave orphan separators. The condition must be
 * hoisted to the child position: a component that internally returns `null` is
 * still counted as a child and would leave a dangling separator.
 */
export function Join({ children, by }: JoinProps): ReactNode {
  const items = Children.toArray(children);

  return items.flatMap((child, index) => {
    if (index === items.length - 1) return [child];

    const separator = isValidElement(by) ? (
      cloneElement(by, { key: `separator-${index}` })
    ) : (
      <Fragment key={`separator-${index}`}>{by}</Fragment>
    );

    return [child, separator];
  });
}
