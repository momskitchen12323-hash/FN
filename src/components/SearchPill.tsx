import { MaterialIcon } from './MaterialIcon';

/**
 * Static, non-functional search affordance that matches Gmail's pill-shaped
 * search field in the top app bar.
 */
export function SearchPill() {
  return (
    <div className="search-pill" role="search" aria-label="Search in mail">
      <MaterialIcon name="search" size={22} className="icon-secondary" />
      <span className="search-pill__text">Search in mail</span>
    </div>
  );
}
