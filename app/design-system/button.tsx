import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type React from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';
import { LoadingIcon } from './icons/loading-icon.tsx';

export type ButtonStylesProps = VariantProps<typeof buttonStyles>;

export const buttonStyles = cva(
  [
    'items-center justify-center',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
  ],
  {
    variants: {
      mode: { icon: 'flex shrink-0', text: 'relative inline-flex whitespace-nowrap' },
      variant: {
        primary: 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 focus:ring-offset-2',
        secondary: 'bg-white text-gray-700 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50',
        important: 'bg-white text-red-600 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-red-50',
        tertiary: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
      },
      size: { base: '', sm: '', xs: '' },
      circle: { true: 'rounded-full', false: 'rounded-md' },
      disabled: { true: 'pointer-events-none opacity-50', false: 'cursor-pointer' },
      loading: { true: 'pointer-events-none', false: '' },
      block: { true: 'w-full', false: '' },
    },
    compoundVariants: [
      { mode: 'text', size: 'base', class: 'h-9 gap-x-2 px-3 py-2 text-sm font-semibold' },
      { mode: 'text', size: 'sm', class: 'h-7 gap-x-1.5 px-2.5 py-1.5 text-xs font-semibold' },
      { mode: 'text', size: 'xs', class: 'h-6 gap-x-1 px-2 py-1 text-xs font-semibold' },
      { mode: 'icon', size: 'base', class: 'size-9' },
      { mode: 'icon', size: 'sm', class: 'size-7' },
      { mode: 'icon', size: 'xs', class: 'size-6' },
    ],
    defaultVariants: {
      mode: 'text',
      variant: 'primary',
      size: 'base',
      circle: false,
      disabled: false,
      loading: false,
      block: false,
    },
  },
);

const iconStyles = cva('shrink-0', {
  variants: {
    variant: { primary: '', secondary: 'text-gray-400', important: 'text-red-500', tertiary: '' },
    size: { base: 'h-5 w-5', sm: 'h-4 w-4', xs: 'h-4 w-4' },
    loading: { true: 'invisible', false: '' },
  },
  defaultVariants: { size: 'base', loading: false },
});

type IconProps = React.ComponentType<{ className?: string }>;
type CommonProps = {
  children?: React.ReactNode;
  icon?: IconProps;
  label?: string;
  iconLeft?: IconProps;
  iconRight?: IconProps;
  iconClassName?: string;
} & Omit<ButtonStylesProps, 'mode'>;

type ButtonBaseProps = CommonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;
type AnchorProps = CommonProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps>;
type RouterLinkProps = CommonProps & Omit<LinkProps, keyof CommonProps>;
type ButtonProps = ButtonBaseProps | RouterLinkProps | AnchorProps;

export function Button(props: ButtonProps) {
  const {
    children,
    label,
    icon: Icon,
    iconLeft: IconLeft,
    iconRight: IconRight,
    variant,
    size,
    circle,
    disabled,
    loading,
    block,
    className,
    iconClassName,
    ...otherProps
  } = props;

  const to = 'to' in otherProps ? otherProps.to : undefined;
  const href = 'href' in otherProps ? otherProps.href : undefined;
  const isDisabled = Boolean(disabled || loading);
  const isIconOnly = Boolean(Icon);

  const buttonClassName = buttonStyles({
    mode: isIconOnly ? 'icon' : 'text',
    variant,
    size,
    circle,
    disabled,
    loading,
    block,
    className,
  });

  const content = isIconOnly ? (
    <>
      {Icon && <Icon className={iconStyles({ size, className: iconClassName })} aria-hidden="true" />}
      <span className="sr-only">{label}</span>
    </>
  ) : (
    <>
      {IconLeft && (
        <IconLeft className={iconStyles({ variant, size, loading, className: iconClassName })} aria-hidden="true" />
      )}
      {loading && <LoadingIcon className={iconStyles({ variant, size, className: 'absolute' })} />}
      <span className={cx({ invisible: loading })}>{children}</span>
      {IconRight && (
        <IconRight className={iconStyles({ variant, size, loading, className: iconClassName })} aria-hidden="true" />
      )}
    </>
  );

  if (to !== undefined) {
    const linkProps = otherProps as Omit<RouterLinkProps, keyof CommonProps>;
    return (
      <Link
        className={buttonClassName}
        aria-disabled={isDisabled ? 'true' : undefined}
        tabIndex={isDisabled ? -1 : 0}
        onClick={isDisabled ? (e) => e.preventDefault() : undefined}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  if (href !== undefined) {
    const anchorProps = otherProps as Omit<AnchorProps, keyof CommonProps>;
    return (
      // oxlint-disable-next-line eslint-plugin-jsx-a11y(click-events-have-key-events),eslint-plugin-jsx-a11y(no-static-element-interactions)
      <a
        className={buttonClassName}
        aria-disabled={isDisabled ? 'true' : undefined}
        tabIndex={isDisabled ? -1 : 0}
        onClick={isDisabled ? (e) => e.preventDefault() : undefined}
        {...anchorProps}
      >
        {content}
      </a>
    );
  }

  const buttonProps = otherProps as Omit<ButtonBaseProps, keyof CommonProps>;
  return (
    <button
      className={buttonClassName}
      disabled={isDisabled}
      aria-disabled={isDisabled ? 'true' : undefined}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
