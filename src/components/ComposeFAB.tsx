import { MaterialIcon } from './MaterialIcon';

interface ComposeFABProps {
  onClick: () => void;
  /** Slides away with the bottom bar when the list is scrolled down. */
  hidden?: boolean;
}

/** Extended "Compose" pill FAB, matching Gmail M3 Expressive. */
export function ComposeFAB({ onClick, hidden }: ComposeFABProps) {
  return (
    <button
      type="button"
      className={`compose-fab ripplable${hidden ? ' compose-fab--hidden' : ''}`}
      aria-label="Compose"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      onClick={onClick}
    >
      <MaterialIcon name="edit" size={20} filled />
      <span>Compose</span>
    </button>
  );
}
