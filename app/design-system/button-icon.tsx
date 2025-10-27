import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type React from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

const mainStyles = cva(
  ['flex items-center justify-center shrink-0 focus:outline-hidden focus:ring-2 focus:ring-indigo-500'],
  {
    variants: {
      variant: {
        primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-offset-2 shadow-xs',
        secondary: 'text-gray-700 bg-white hover:bg-gray-50 ring-1 ring-inset ring-gray-300 shadow-xs',
        important: 'text-red-600 bg-white hover:bg-red-50 ring-1 ring-inset ring-gray-300 shadow-xs',
        tertiary: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      },
      size: {
        base: 'size-9',
        sm: 'size-7',
        xs: 'size-6',
      },
      circle: {
        true: 'rounded-full',
        false: 'rounded-md',
      },
      disabled: {
        true: 'opacity-50 pointer-events-none',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'base',
      circle: false,
      disabled: false,
    },
  },
);

const iconStyles = cva('', {
  variants: { size: { base: 'h-5 w-5', sm: 'h-4 w-4', xs: 'h-4 w-4' } },
  defaultVariants: { size: 'base' },
});

type IconProps = React.ComponentType<{ className?: string }>;
type CommonProps = { label: string; icon: IconProps } & VariantProps<typeof mainStyles>;
type ButtonProps = CommonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | 'children'>;
type AnchorProps = CommonProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | 'children'>;
type RouterLinkProps = CommonProps & Omit<LinkProps, keyof CommonProps | 'children'>;
type ButtonIconProps = ButtonProps | RouterLinkProps | AnchorProps;

export function ButtonIcon(props: ButtonIconProps) {
  const { icon: Icon, label, variant, size, circle, disabled, className, ...otherProps } = props;

  const to = 'to' in otherProps ? otherProps.to : undefined;
  const href = 'href' in otherProps ? otherProps.href : undefined;

  if (to !== undefined) {
    const linkProps = otherProps as Omit<RouterLinkProps, keyof CommonProps>;
    return (
      <Link
        className={mainStyles({ variant, size, circle, disabled, className })}
        aria-disabled={disabled ? 'true' : undefined}
        tabIndex={disabled ? -1 : 0}
        {...linkProps}
      >
        <Icon className={iconStyles({ size })} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </Link>
    );
  }

  if (href !== undefined) {
    const anchorProps = otherProps as Omit<AnchorProps, keyof CommonProps>;
    return (
      <a
        className={mainStyles({ variant, size, circle, disabled, className })}
        aria-disabled={disabled ? 'true' : undefined}
        tabIndex={disabled ? -1 : 0}
        {...anchorProps}
      >
        <Icon className={iconStyles({ size })} aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </a>
    );
  }

  const buttonProps = otherProps as Omit<ButtonProps, keyof CommonProps>;
  return (
    <button
      className={mainStyles({ variant, size, circle, disabled, className })}
      disabled={disabled ?? undefined}
      {...buttonProps}
    >
      <Icon className={iconStyles({ size })} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
