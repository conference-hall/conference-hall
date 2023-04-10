import { NavLink } from './NavLink';

type Props = { hasOrganization: boolean };

export function SpeakerLinks({ hasOrganization }: Props) {
  return (
    <>
      <NavLink to="/speaker" end>
        Activity
      </NavLink>
      <NavLink to="/speaker/talks">Talks</NavLink>
      <NavLink to="/speaker/profile">Profile</NavLink>
      {hasOrganization && <NavLink to="/organizer">Organizations</NavLink>}
    </>
  );
}
