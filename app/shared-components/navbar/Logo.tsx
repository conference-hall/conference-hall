import { Link } from '@remix-run/react';

export function Logo() {
  return (
    <Link to="/" title="Go to event search">
      <img className="h-8 w-8" src="https://tailwindui.com/img/logos/workflow-mark-indigo-300.svg" aria-hidden alt="" />
    </Link>
  );
}
