import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type React from 'react';

export const typography = cva('', {
  variants: {
    variant: {
      primary: 'text-gray-900',
      secondary: 'text-gray-500',
      link: 'text-indigo-600',
      warning: 'text-yellow-700',
      error: 'text-red-600',
      light: 'text-gray-50',
      'secondary-light': 'text-gray-300',
    },
    size: {
      '4xl': 'text-4xl',
      '3xl': 'text-3xl',
      '2xl': 'text-2xl',
      xl: 'text-xl',
      l: 'text-lg',
      base: 'text-base',
      s: 'text-sm',
      xs: 'text-xs',
    },
    mb: { 1: 'mb-1', 2: 'mb-2', 4: 'mb-4', 6: 'mb-6', 8: 'mb-8' },
    align: { center: 'text-center' },
    weight: { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' },
    srOnly: { true: 'sr-only' },
    truncate: { true: 'truncate', false: 'wrap-break-words' },
  },
  defaultVariants: { variant: 'primary', size: 's' },
});

export type TypographyVariantProps = VariantProps<typeof typography>;

export type TypographyProps = {
  id?: string;
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
} & TypographyVariantProps;

function Typography({ id, as: Tag = 'p', children, className, ...rest }: TypographyProps) {
  return (
    <Tag id={id} className={cx(typography(rest), className)}>
      {children}
    </Tag>
  );
}

export function H1(props: TypographyProps) {
  return <Typography as="h1" size="l" weight="semibold" {...props} />;
}

export function H2(props: TypographyProps) {
  return <Typography as="h2" size="base" weight="semibold" {...props} />;
}

export function H3(props: TypographyProps) {
  return <Typography as="h3" size="s" weight="semibold" {...props} />;
}

export function Text(props: TypographyProps) {
  return <Typography as="p" {...props} />;
}

export function Subtitle(props: TypographyProps) {
  return <Text as="p" variant="secondary" {...props} />;
}

export function Label({
  id,
  children,
  htmlFor,
  className,
  ...rest
}: TypographyVariantProps & React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      id={id}
      htmlFor={htmlFor}
      className={typography({ size: 's', weight: 'medium', ...rest, className: cx(['block leading-6', className]) })}
    >
      {children}
    </label>
  );
}
