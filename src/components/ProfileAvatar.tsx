import type { CSSProperties } from 'react';

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

function initialsFor(name: string): string {
  const honorific = /^(dr|mr|mrs|ms|prof)$/i;
  const parts = name
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .trim()
    .split(/\s+/)
    .filter((p) => p && p !== '&' && !honorific.test(p));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Circular letter avatar with a deterministic background color, used for the
 * account (top bar, drawer) and every sender/recipient in the lists.
 */
export function ProfileAvatar({ name, color = '#7B1FA2', size = 40, className = '', style }: AvatarProps) {
  return (
    <div
      className={`avatar${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, background: color, fontSize: Math.round(size * 0.42), ...style }}
      aria-hidden="true"
    >
      {initialsFor(name)}
    </div>
  );
}
