import { XMarkIcon } from '@heroicons/react/20/solid';
import { BackButton, useBackNavigation } from './buttons/back-button.tsx';
import { LogoButton } from './buttons/logo-button.tsx';

export function NavbarFullscreen() {
  const { backPath } = useBackNavigation([
    { path: '/team/:team/new/*', back: '/team/:team' },
    { path: '/*', back: '/' },
  ]);

  return (
    <div className="flex h-16 items-center justify-between px-4 lg:px-8 bg-transparent absolute inset-x-0 z-30">
      <LogoButton hideLabel />
      <BackButton to={backPath} icon={XMarkIcon} className="text-gray-800 lg:text-white" />
    </div>
  );
}
