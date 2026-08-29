import { cx } from 'class-variance-authority';
import * as React from 'react';
import { useNavigation } from 'react-router';

// Component copied from Gustavo Guichard
// source: https://dev.to/gugaguichard/creating-a-github-like-progress-bar-for-your-remix-app-153l
function GlobalLoadingComponent() {
  const { state } = useNavigation();
  const active = state !== 'idle';

  const ref = React.useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = React.useState(true);
  const [wasActive, setWasActive] = React.useState(false);

  // A starting navigation resets the completion flag during render, so no effect has to trigger a second render
  if (wasActive !== active) {
    setWasActive(active);
    if (active) setAnimationComplete(false);
  }

  React.useEffect(() => {
    if (!ref.current) return;

    Promise.allSettled(ref.current.getAnimations().map(({ finished }) => finished)).then(
      () => !active && setAnimationComplete(true),
    );
  }, [active]);

  return (
    <div aria-hidden={!active} className="fixed inset-x-0 top-0 left-0 z-50 h-1">
      <div
        ref={ref}
        className={cx(
          'h-full bg-indigo-200 transition-all duration-500 ease-in-out',
          state === 'idle' && animationComplete && 'w-0 transition-none',
          state === 'submitting' && 'w-3/12',
          state === 'loading' && 'w-6/12',
          state === 'idle' && !animationComplete && 'w-full',
        )}
      />
    </div>
  );
}

export const GlobalLoading = React.memo(GlobalLoadingComponent);
