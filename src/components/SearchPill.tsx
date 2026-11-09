import { GeminiIcon } from './GeminiIcon';

/** Gmail 2026 search pill: white, centred placeholder, Gemini sparkle at right. */
export function SearchPill() {
  return (
    <div className="search-pill" role="search" aria-label="Search in mail">
      <span className="search-pill__text">Search in mail</span>
      <span className="search-pill__gemini">
        <GeminiIcon size={22} />
      </span>
    </div>
  );
}
