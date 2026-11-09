import { GeminiIcon } from './GeminiIcon';

interface SearchPillProps {
  label?: string;
  onOpen?: () => void;
  /** Show the Gemini sparkle inside the pill (all screens except Chat). */
  spark?: boolean;
}

/** Gmail search pill; opens the search screen. */
export function SearchPill({ label = 'Search in mail', onOpen, spark = true }: SearchPillProps) {
  return (
    <button
      type="button"
      className="search-pill ripplable"
      role="search"
      aria-label={label}
      onClick={onOpen}
    >
      <span className="search-pill__text">{label}</span>
      {spark && (
        <span className="search-pill__gemini" aria-hidden="true">
          <GeminiIcon size={22} />
        </span>
      )}
    </button>
  );
}
