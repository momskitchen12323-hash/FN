import { MaterialIcon } from './MaterialIcon';

interface ComposeFABProps {
  onClick: () => void;
}

/** Extended "Compose" pill FAB, matching Gmail 2026. */
export function ComposeFAB({ onClick }: ComposeFABProps) {
  return (
    <button type="button" className="compose-fab" aria-label="Compose" onClick={onClick}>
      <MaterialIcon name="edit" size={20} filled />
      <span>Compose</span>
    </button>
  );
}
