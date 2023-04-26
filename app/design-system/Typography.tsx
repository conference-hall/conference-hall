import React from 'react';
import c from 'classnames';

const SIZES = {
  '4xl': 'text-4xl',
  '3xl': 'text-3xl',
  '2xl': 'text-2xl',
  xl: 'text-xl',
  l: 'text-lg',
  base: 'text-base',
  s: 'text-sm',
  xs: 'text-xs',
};

const ALIGNMENTS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const VARIANTS = {
  primary: 'text-gray-900',
  secondary: 'text-gray-600',
  link: 'text-indigo-600',
  warning: 'text-yellow-700',
  error: 'text-red-600',
  light: 'text-gray-50',
  'secondary-light': 'text-gray-300',
};

const MARGINS = {
  0: 'mb-0',
  1: 'mb-1',
  2: 'mb-2',
  4: 'mb-4',
  6: 'mb-6',
  8: 'mb-8',
  10: 'mb-10',
  16: 'mb-16',
};

export type TypographyProps = {
  id?: string;
  as?: React.ElementType;
  variant?: keyof typeof VARIANTS;
  align?: keyof typeof ALIGNMENTS;
  size?: keyof typeof SIZES;
  mb?: keyof typeof MARGINS;
  heading?: boolean;
  strong?: boolean;
  italic?: boolean;
  srOnly?: boolean;
  truncate?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
};

function Typography({
  id,
  as: Tag = 'p',
  variant = 'primary',
  align = 'left',
  mb,
  size,
  heading,
  strong,
  italic,
  srOnly,
  truncate,
  htmlFor,
  children,
}: TypographyProps) {
  const variantStyle = variant ? VARIANTS[variant] : undefined;
  const alignStyle = align ? ALIGNMENTS[align] : undefined;
  const sizeStyle = size ? SIZES[size] : undefined;
  const marginStyle = mb !== undefined ? MARGINS[mb] : 0;

  return (
    <Tag
      id={id}
      htmlFor={htmlFor}
      className={c(variantStyle, alignStyle, sizeStyle, marginStyle, {
        'font-heading': heading,
        'font-medium': strong,
        'sr-only': srOnly,
        truncate,
        italic,
      })}
    >
      {children}
    </Tag>
  );
}

export function H1(props: TypographyProps) {
  return <Typography as="h1" size="3xl" heading strong {...props} />;
}

export function H2(props: TypographyProps) {
  return <Typography as="h2" size="2xl" heading strong {...props} />;
}

export function H3(props: TypographyProps) {
  return <Typography as="h3" size="xl" heading strong {...props} />;
}

export function Text(props: TypographyProps) {
  return <Typography as="p" size="base" {...props} />;
}

export function Subtitle(props: TypographyProps) {
  return <Text as="p" size="s" variant="secondary" {...props} />;
}
