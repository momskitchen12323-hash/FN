/** Simplified Gmail "M" badge used in M3 snackbar events (e.g. draft saved). */
export function GmailMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M2 6.5 12 13l10-6.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v.5Z" opacity="0" />
      <path fill="#EA4335" d="M2 5.9v12.2a2 2 0 0 0 2 2h1.6V11L2 5.9Z" />
      <path fill="#FBBC04" d="M2 4.6 12 11.2 22 4.6 12 4A2.2 2.2 0 0 0 2 4.6Z" opacity="0" />
      <path fill="#FBBC04" d="M2 4.9c0-.1 0-.2.1-.3l10 6.6-9.4-.01L2 4.9Z" opacity="0" />
      <path fill="#11A861" d="M22 5.9v12.2a2 2 0 0 1-2 2h-1.6V11l3.6-5.1Z" />
      <path fill="#4285F4" d="M5.6 11v9.1h12.8V11L12 15.9 5.6 11Z" />
      <path fill="#EA4335" d="M2 4.9c0 .9.4 1.6 1.2 2.2L12 13l3.6-2h1.6Z" opacity="0" />
      <path fill="#EA4335" d="M3.2 7.1 12 13l-3.1-2.1L3.2 7.1Z" opacity="0" />
      <path fill="#EA4335" d="m2 4.6 10 6.6 10-6.6-1.4-1.2-8.6 5.7L3.4 3.4 2 4.6Z" opacity="0" />
      <path fill="#EA4335" d="m2 4.7 10 6.5h.1l10-6.5c-.3-.9-1.1-1.5-1.5-1.7L12 9.6 3.4 3c-.5.2-1.4.8-1.4 1.7Z" opacity="0" />
      <path fill="#EA4335" d="m2 4.7 10 6.5h.1L22 4.7c-.3-.9-1-1.4-1.5-1.6L12 9.4 3.5 3.1C3 3.3 2.3 3.8 2 4.7Z" opacity="0" />
      <path fill="#EA4335" d="m2 4.7 10 6.5h.1L22 4.7c-.3-.9-1-1.4-1.5-1.6L12 9.4 3.5 3.1C3 3.3 2.3 3.8 2 4.7Z" />
    </svg>
  );
}
