import { Form, Link } from '@remix-run/react';
import { getAuth } from 'firebase/auth';

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
      <MenuLink to="/speaker">Activity</MenuLink>
      <MenuLink to="/speaker/talks">Your talk</MenuLink>
      <MenuLink to="/speaker/profile">Your profile</MenuLink>
      <MenuLink to="/organizer">Your organizations</MenuLink>
      <Form action="/logout" method="post">
        <button type="submit" onClick={() => getAuth().signOut()} className={`${STYLE} w-full text-left`}>
          Sign out
        </button>
      </Form>
    </div>
  );
}
