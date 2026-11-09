import { MaterialIcon } from './MaterialIcon';
import { SearchPill } from './SearchPill';
import { ProfileAvatar } from './ProfileAvatar';
import { ACCOUNT, ACCOUNT_COLOR } from '../data/emails';

interface AppBarProps {
  onMenu: () => void;
}

/**
 * Current Gmail Android top bar: hamburger, large white search pill with the
 * Gemini sparkle, and the account avatar. No Gmail wordmark.
 */
export function AppBar({ onMenu }: AppBarProps) {
  return (
    <header className="appbar">
      <button type="button" className="icon-btn appbar__menu" aria-label="Main menu" onClick={onMenu}>
        <MaterialIcon name="menu" className="icon-secondary" />
      </button>
      <SearchPill />
      <button type="button" className="appbar__avatar-btn" aria-label="Google Account: Sihle Mkhize">
        <ProfileAvatar name={ACCOUNT.name} color={ACCOUNT_COLOR} size={34} />
      </button>
    </header>
  );
}
