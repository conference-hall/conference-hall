import type { VariantProps } from 'class-variance-authority';
import { cva, cx } from 'class-variance-authority';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { LinkProps as RouterLinkProps } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { Button } from './button.tsx';
import { Modal } from './dialogs/modals.tsx';
import type { TypographyVariantProps } from './typography.tsx';
import { Text, typography } from './typography.tsx';

export const link = cva('inline-flex items-center hover:underline', {
  variants: {
    variant: {
      primary: 'text-indigo-600',
      secondary: 'text-gray-900',
      'secondary-light': 'text-gray-300',
    },
  },
  defaultVariants: { variant: 'primary' },
});

type LinkVariants = VariantProps<typeof link> & Omit<TypographyVariantProps, 'variant'>;

type Icon = React.ComponentType<{ className?: string }>;

type LinkIcons = { iconLeft?: Icon; iconRight?: Icon };

type LinkProps = LinkVariants & LinkIcons & RouterLinkProps;

export function Link({
  to,
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
  variant,
  size,
  mb,
  align,
  weight,
  truncate,
  className,
  ...rest
}: LinkProps) {
  const defaultStyle = typography({ size, mb, align, weight, truncate, variant, className });
  const linkStyle = link({ variant });

  return (
    <RouterLink to={to} className={cx(defaultStyle, linkStyle)} {...rest}>
      {IconLeft && <IconLeft className="mr-1.5 h-5 w-5" aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className="ml-1.5 h-5 w-5" aria-hidden="true" />}
    </RouterLink>
  );
}

type ExternalLinkProps = LinkVariants &
  LinkIcons & { untrusted?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export function ExternalLink({
  href,
  children,
  iconLeft: IconLeft,
  iconRight: IconRight,
  variant,
  size,
  mb,
  align,
  weight,
  truncate,
  className,
  untrusted = false,
  onClick,
  ...rest
}: ExternalLinkProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const defaultStyle = typography({ size, mb, align, weight, truncate, className });
  const linkStyle = link({ variant });

  // Left click and ctrl/cmd+click go through `onClick`, middle click through `onAuxClick`.
  const askConfirmation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const anchor = (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cx(defaultStyle, linkStyle)}
      onClick={untrusted && href ? askConfirmation : onClick}
      onAuxClick={untrusted && href ? askConfirmation : undefined}
      {...rest}
    >
      {IconLeft && <IconLeft className="mr-2 size-4 shrink-0 opacity-75" aria-hidden="true" />}
      {children}
      {IconRight && <IconRight className="ml-2 size-4 shrink-0 opacity-75" aria-hidden="true" />}
    </a>
  );

  if (!untrusted || !href) return anchor;

  return (
    <>
      {anchor}
      <UntrustedLinkModal href={href} open={confirmOpen} onClose={() => setConfirmOpen(false)} />
    </>
  );
}

type UntrustedLinkModalProps = { href: string; open: boolean; onClose: VoidFunction };

function UntrustedLinkModal({ href, open, onClose }: UntrustedLinkModalProps) {
  const { t } = useTranslation();

  return (
    <Modal title={t('common.external-link.confirm.title')} open={open} onClose={onClose}>
      <Modal.Content className="space-y-4">
        <Text>{t('common.external-link.confirm.description')}</Text>
        <code className="block rounded-md bg-gray-100 p-4 text-xs break-all">{href}</code>
      </Modal.Content>

      <Modal.Actions>
        <Button variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button href={href} target="_blank" rel="noreferrer" onClick={onClose}>
          {t('common.external-link.confirm.open')}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
