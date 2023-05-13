import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import type { MouseEventHandler, ReactNode } from 'react';

import { IconButton, IconButtonLink } from '~/design-system/IconButtons';
import { H2, Subtitle } from '~/design-system/Typography';

import { Container } from './Container';
import { PageHeader } from './PageHeader';

type Props = { title: string; subtitle?: string; children?: ReactNode } & BackButtonProps;

export function PageHeaderTitle({ title, subtitle, backTo, backOnClick, children }: Props) {
  return (
    <PageHeader>
      <Container className="flex h-full flex-col gap-4 px-4 py-6 sm:h-24 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4">
          <BackButton backTo={backTo} backOnClick={backOnClick} />
          <div className="truncate">
            <H2 size="xl" mb={0} truncate>
              {title}
            </H2>
            {subtitle && <Subtitle truncate>{subtitle}</Subtitle>}
          </div>
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
