import { MaterialIcon } from './MaterialIcon';
import { SearchPill } from './SearchPill';
import { ProfileAvatar } from './ProfileAvatar';
import { ACCOUNT, ACCOUNT_COLOR } from '../data/emails';

interface AppBarProps {
  onMenu?: () => void;
  onSearch?: () => void;
  /** Pill placeholder text ("Search in mail" on Mail, "Search in chat" on Chat). */
  pillLabel?: string;
  /** Hide the Gemini sparkle (Chat screens). */
  spark?: boolean;
}

/** Gmail top bar: hamburger, large search pill (+ Gemini sparkle), account avatar. */
export function AppBar({ onMenu, onSearch, pillLabel = 'Search in mail', spark = true }: AppBarProps) {
  return (
    <header className="appbar">
      <button type="button" className="icon-btn appbar__menu ripplable" aria-label="Main menu" onClick={onMenu}>
        <MaterialIcon name="menu" className="icon-secondary" />
      </button>
      <SearchPill label={pillLabel} onOpen={onSearch} spark={spark} />
      <button type="button" className="appbar__avatar-btn ripplable" aria-label="Google Account: Sihle Mkhize">
        <ProfileAvatar name={ACCOUNT.name} color={ACCOUNT_COLOR} size={34} />
      </button>
    </header>
  );
}
