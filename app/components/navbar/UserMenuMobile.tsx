import { Link } from '@remix-run/react';

const STYLE = 'block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white';

function MenuLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className={STYLE}>
      {children}
    </Link>
  );
}

export function UserMenuMobile() {
  return (
    <div className="mt-3 space-y-1 px-2">
      <MenuLink to="/speaker">Home</MenuLink>
      <MenuLink to="/speaker/talks">Talks</MenuLink>
      <MenuLink to="/speaker/profile">Profile</MenuLink>
      <MenuLink to="/team">Teams</MenuLink>
      <MenuLink to="/logout">Sign out</MenuLink>
    </div>
  );
}