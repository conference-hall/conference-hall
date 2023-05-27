import { useNavigation } from '@remix-run/react';
import { cx } from 'class-variance-authority';
import * as React from 'react';

// Component copied from Gustavo Guichard
// source: https://dev.to/gugaguichard/creating-a-github-like-progress-bar-for-your-remix-app-153l
function GlobalLoadingComponent() {
  const { state } = useNavigation();
  const active = state !== 'idle';

  const ref = React.useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = React.useState(true);

  React.useEffect(() => {
    if (!ref.current) return;
    if (active) setAnimationComplete(false);

    Promise.allSettled(ref.current.getAnimations().map(({ finished }) => finished)).then(
      () => !active && setAnimationComplete(true)
    );
  }, [active]);

  return (
    <div
      role="progressbar"
      aria-hidden={!active}
      aria-valuetext={active ? 'Loading' : undefined}
      className="fixed inset-x-0 left-0 top-0 z-50 h-0.5 animate-pulse"
    >
      <div
        ref={ref}
        className={cx(
          'h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-in-out',
          state === 'idle' && animationComplete && 'w-0 opacity-0 transition-none',
          state === 'submitting' && 'w-4/12',
          state === 'loading' && 'w-10/12',
          state === 'idle' && !animationComplete && 'w-full'
        )}
      />
    </div>
  );
}

export const GlobalLoading = React.memo(GlobalLoadingComponent);
