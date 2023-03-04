import React from 'react';
import c from 'classnames';

const titleSize = {
  h1: 'leading-tight text-2xl font-bold',
  h2: 'leading-tight text-lg font-semibold',
  h3: 'leading-tight text-base font-medium',
};

const titleColors = {
  primary: 'text-gray-900',
};

type TitleProps = {
  id?: string;
  variant?: keyof typeof titleColors;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
};

function Title({ variant = 'primary', size, as, className, ...rest }: TitleProps & { size: keyof typeof titleSize }) {
  const Tag = as ?? size;
  return <Tag className={c(titleSize[size], titleColors[variant], className)} {...rest} />;
}

export function H1(props: TitleProps) {
  return <Title {...props} size="h1" />;
}

export function H2(props: TitleProps) {
  return <Title {...props} size="h2" />;
}

export function H3(props: TitleProps) {
  return <Title {...props} size="h3" />;
}

const textSize = {
  xl: 'text-xl',
  l: 'text-lg',
  m: 'text-base',
  s: 'text-sm',
  xs: 'text-xs',
};

const textColors = {
  primary: 'text-gray-900',
  secondary: 'text-gray-500',
  link: 'text-indigo-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
};

type TextProps = {
  variant?: keyof typeof textColors;
  size?: keyof typeof textSize;
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
};

export function Text({ variant = 'primary', size = 's', className, as = 'p', ...rest }: TextProps) {
  const Tag = as ?? 'p';
  return <Tag className={c(textSize[size], textColors[variant], className)} {...rest} />;
}
