import { MaterialIcon } from './MaterialIcon';

/** Gmail bottom navigation: exactly Mail and Meet. */
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      <button type="button" className="bottom-tab bottom-tab--active" aria-current="page" aria-label="Mail">
        <span className="bottom-tab__icon-wrap">
          <MaterialIcon name="mail" filled />
        </span>
        <span className="bottom-tab__label">Mail</span>
      </button>
      <button type="button" className="bottom-tab" aria-label="Meet">
        <span className="bottom-tab__icon-wrap">
          <MaterialIcon name="videocam" />
        </span>
        <span className="bottom-tab__label">Meet</span>
      </button>
    </nav>
  );
}
