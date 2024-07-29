// Tremor Raw Callout [v0.0.0]

import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import React from 'react';

const calloutVariants = cva('flex flex-col overflow-hidden rounded-md p-4 text-sm', {
  variants: {
    variant: {
      default: [
        // text color
        'text-blue-900',
        // background color
        'bg-blue-50',
      ],
      success: [
        // text color
        'text-emerald-900',
        // background color
        'bg-emerald-50',
      ],
      error: [
        // text color
        ' text-red-900',
        // background color
        'bg-red-50',
      ],
      warning: [
        // text color
        ' text-yellow-900',
        // background color
        'bg-yellow-50',
      ],
      neutral: [
        // text color
        'text-gray-900',
        // background color
        'bg-gray-100',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface CalloutProps extends React.ComponentPropsWithoutRef<'div'>, VariantProps<typeof calloutVariants> {
  title?: string;
  icon?: React.ElementType;
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ title, icon: Icon, className, variant, children, ...props }: CalloutProps, forwardedRef) => {
    return (
      <div ref={forwardedRef} className={cx(calloutVariants({ variant }), className)} {...props}>
        {title ? (
          <div className="flex items-start">
            {Icon ? <Icon className={cx('mr-1.5 h-5 w-5 shrink-0')} aria-hidden="true" /> : null}
            <span className={cx('font-semibold')}>{title}</span>
          </div>
        ) : null}
        <div className={cx('overflow-y-auto', children && title ? 'mt-2' : '')}>{children}</div>
      </div>
    );
  },
);

Callout.displayName = 'Callout';

export { Callout, type CalloutProps, calloutVariants };
