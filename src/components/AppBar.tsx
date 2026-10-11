import { MaterialIcon } from './MaterialIcon';
import { GmailLogo } from './GmailLogo';
import { SearchPill } from './SearchPill';
import { ProfileAvatar } from './ProfileAvatar';
import { ACCOUNT, ACCOUNT_COLOR } from '../data/emails';

interface AppBarProps {
  onMenu: () => void;
}

/** Gmail Android top app bar: hamburger, Gmail logo, search pill, profile avatar. */
export function AppBar({ onMenu }: AppBarProps) {
  return (
    <header className="appbar">
      <button type="button" className="icon-btn" aria-label="Main menu" onClick={onMenu}>
        <MaterialIcon name="menu" className="icon-secondary" />
      </button>
      <GmailLogo height={24} className="appbar__logo" />
      <SearchPill />
      <button type="button" className="icon-btn" aria-label="Google account: Alex Morgan" style={{ marginLeft: 6 }}>
        <ProfileAvatar name={ACCOUNT.name} color={ACCOUNT_COLOR} size={36} />
      </button>
    </header>
  );
}
