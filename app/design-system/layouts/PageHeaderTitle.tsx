import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/20/solid';
import type { MouseEventHandler, ReactNode } from 'react';

import { IconButton, IconButtonLink } from '~/design-system/IconButtons.tsx';
import { H1, Subtitle } from '~/design-system/Typography.tsx';

import { Container } from './Container.tsx';
import { PageHeader } from './PageHeader.tsx';

type Props = { title: string; subtitle?: string; children?: ReactNode } & BackButtonProps & CloseButtonProps;

export function PageHeaderTitle({ title, subtitle, backTo, backOnClick, closeTo, closeOnClick, children }: Props) {
  return (
    <PageHeader>
      <Container className="flex h-fit flex-col gap-4 py-4 sm:h-24 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4 w-full">
          <BackButton backTo={backTo} backOnClick={backOnClick} />
          <div className="truncate w-full">
            <H1 truncate>{title}</H1>
            {subtitle && (
              <Subtitle className="hidden sm:inline-block" truncate>
                {subtitle}
              </Subtitle>
            )}
          </div>
          <CloseButton closeTo={closeTo} closeOnClick={closeOnClick} />
        </div>

        {children && <div className="flex flex-col-reverse gap-4 sm:mt-0 sm:flex-row">{children}</div>}
      </Container>
    </PageHeader>
  );
}

type BackButtonProps = {
  backTo?: string;
  backOnClick?: MouseEventHandler<HTMLButtonElement>;
};

function BackButton({ backTo, backOnClick }: BackButtonProps) {
  if (backTo) {
    return <IconButtonLink icon={ArrowLeftIcon} variant="secondary" to={backTo} label="Go back" />;
  }
  if (backOnClick) {
    return <IconButton icon={ArrowLeftIcon} variant="secondary" onClick={backOnClick} label="Go back" />;
  }
  return null;
}

type CloseButtonProps = {
  closeTo?: string;
  closeOnClick?: MouseEventHandler<HTMLButtonElement>;
};

function CloseButton({ closeTo, closeOnClick }: CloseButtonProps) {
  if (closeTo) {
    return <IconButtonLink icon={XMarkIcon} variant="secondary" to={closeTo} label="Close" />;
  }
  if (closeOnClick) {
    return <IconButton icon={XMarkIcon} variant="secondary" onClick={closeOnClick} label="Close" />;
  }
  return null;
}
