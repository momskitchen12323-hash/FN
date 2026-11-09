import { MaterialIcon } from './MaterialIcon';

interface BottomNavProps {
  unreadCount?: number;
}

/** Floating, icon-only Gmail navigation bar: Mail (with unread badge) + Meet. */
export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const badge = unreadCount > 99 ? '99+' : String(unreadCount);
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <button type="button" className="nav-btn nav-btn--active" aria-current="page" aria-label="Mail">
        <span className="nav-indicator">
          <MaterialIcon name="mail" filled />
          {unreadCount > 0 && <span className="nav-badge">{badge}</span>}
        </span>
      </button>
      <button type="button" className="nav-btn" aria-label="Meet">
        <span className="nav-indicator">
          <MaterialIcon name="videocam" />
        </span>
      </button>
    </nav>
  );
}
