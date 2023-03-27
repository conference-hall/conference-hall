import React from 'react';
import c from 'classnames';

const VARIANTS = {
  body: { tag: 'p', style: 'text-base', margin: 'mb-0' },
  h1: { tag: 'h1', style: 'font-heading font-medium leading-tight text-4xl', margin: 'mb-4' },
  h2: { tag: 'h2', style: 'font-heading font-medium leading-tight text-2xl', margin: 'mb-4' },
  h3: { tag: 'h3', style: 'font-heading font-medium leading-tight text-xl', margin: 'mb-2' },
  h4: { tag: 'h4', style: 'font-heading font-medium leading-tight text-lg', margin: 'mb-1' },
};

const SIZES = {
  xl: 'text-xl',
  l: 'text-lg',
  m: 'text-base',
  s: 'text-sm',
  xs: 'text-xs',
};

const COLORS = {
  primary: 'text-gray-900',
  secondary: 'text-gray-500',
  link: 'text-indigo-600',
  warning: 'text-yellow-700',
  error: 'text-red-600',
  light: 'text-gray-50',
};

const ALIGNMENTS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

type TypographyProps = {
  id?: string;
  as?: React.ElementType;
  variant?: keyof typeof VARIANTS;
  type?: keyof typeof COLORS;
  align?: keyof typeof ALIGNMENTS;
  size?: keyof typeof SIZES;
  mb?: number;
  strong?: boolean;
  italic?: boolean;
  srOnly?: boolean;
  truncate?: boolean;
  children: React.ReactNode;
};

function Typography({
  id,
  as,
  variant = 'body',
  type = 'primary',
  align = 'left',
  mb,
  size,
  strong,
  italic,
  srOnly,
  truncate,
  children,
}: TypographyProps) {
  const { tag, style, margin } = VARIANTS[variant];
  const Tag = as || tag;

  const colorStyle = type ? COLORS[type] : undefined;
  const alignStyle = align ? ALIGNMENTS[align] : undefined;
  const sizeStyle = size ? SIZES[size] : undefined;
  const marginStyle = mb !== undefined ? `mb-${mb}` : margin;

  return (
    <Tag
      id={id}
      className={c(style, colorStyle, alignStyle, sizeStyle, marginStyle, {
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
  return <Typography {...props} variant="h1" />;
}

export function H2(props: TypographyProps) {
  return <Typography {...props} variant="h2" />;
}

export function H3(props: TypographyProps) {
  return <Typography {...props} variant="h3" />;
}

export function H4(props: TypographyProps) {
  return <Typography {...props} variant="h4" />;
}

export function Text(props: TypographyProps) {
  return <Typography {...props} variant="body" />;
}

export function Subtitle(props: TypographyProps) {
  return <Text {...props} size="s" type="secondary" />;
}
