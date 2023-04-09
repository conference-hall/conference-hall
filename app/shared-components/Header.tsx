import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import type { MouseEventHandler, ReactNode } from 'react';
import { Container } from '~/design-system/Container';
import { IconButton, IconButtonLink } from '~/design-system/IconButtons';
import { H2, Subtitle } from '~/design-system/Typography';

type Props = { title: string; subtitle?: string; children?: ReactNode } & BackButtonProps;

export function Header({ title, subtitle, backTo, backOnClick, children }: Props) {
  return (
    <header className="bg-white shadow">
      <Container className="flex h-24 flex-col px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <BackButton backTo={backTo} backOnClick={backOnClick} />
          <div>
            <H2 size="xl" mb={0}>
              {title}
            </H2>
            {subtitle && <Subtitle>{subtitle}</Subtitle>}
          </div>
        </div>

        {children && <div className="flex flex-col gap-4 sm:mt-0 sm:flex-row">{children}</div>}
      </Container>
    </header>
  );
}

type BackButtonProps = {
  backTo?: string;
  backOnClick?: MouseEventHandler<HTMLButtonElement>;
};

function BackButton({ backTo, backOnClick }: BackButtonProps) {
  if (backTo) {
    return <IconButtonLink icon={ArrowLeftIcon} variant="secondary" to={backTo} aria-label="Go back" />;
  }
  if (backOnClick) {
    return <IconButton icon={ArrowLeftIcon} variant="secondary" onClick={backOnClick} aria-label="Go back" />;
  }
  return null;
}
