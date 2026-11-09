/** Gemini four-point sparkle used in the Gmail search bar. */
export function GeminiIcon({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="gemini-spark" x1="3" y1="22" x2="21" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path
        fill="url(#gemini-spark)"
        d="M12 1.9c.6 5.55 3.65 8.6 9.2 9.2-5.55.6-8.6 3.65-9.2 9.2-.6-5.55-3.65-8.6-9.2-9.2 5.55-.6 8.6-3.65 9.2-9.2Z"
      />
    </svg>
  );
}
