/**
 * Multicolor Gmail-style pencil used inside the compose FAB, drawn with the
 * four Google brand colors so no icon-font glyph is required.
 */
export function ComposePencilIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g transform="rotate(45 12 12)">
        <rect x="6.8" y="2" width="10.4" height="3.4" rx="1.6" fill="#EA4335" />
        <rect x="7.6" y="5.8" width="8.8" height="1.8" fill="#F9AB00" />
        <rect x="7.6" y="8" width="8.8" height="9" fill="#1A73E8" />
        <path d="M7.6 17 L16.4 17 L12 22.6 Z" fill="#34A853" />
      </g>
    </svg>
  );
}

interface ComposeFABProps {
  onClick: () => void;
}

/** Circular pale-blue Compose FAB, floating above the bottom navigation. */
export function ComposeFAB({ onClick }: ComposeFABProps) {
  return (
    <button type="button" className="compose-fab" aria-label="Compose" onClick={onClick}>
      <ComposePencilIcon size={24} />
    </button>
  );
}
