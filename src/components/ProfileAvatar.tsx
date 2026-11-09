import type { CSSProperties } from 'react';

interface AvatarProps {
  name: string;
  /** Explicit background override (e.g. the account avatar). */
  color?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** Gmail's generated avatar palette (varied, deterministic). */
const AVATAR_COLORS = [
  '#ea8600',
  '#188038',
  '#1a73e8',
  '#8430ce',
  '#c5221f',
  '#00897b',
  '#d01884',
  '#f9ab00',
  '#795548',
  '#3949ab',
  '#00838f',
  '#689f38',
];

function hashOf(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

function firstLetter(name: string): string {
  const clean = name
    .replace(/^to:\s*/i, '')
    .replace(/^me\b[,:]?\s*/i, '')
    .replace(/<[^>]*>/g, '')
    .trim();
  const m = clean.match(/[\p{L}\p{N}]/u);
  return m ? m[0].toUpperCase() : '?';
}

/**
 * Circular letter avatar matching Gmail's generated avatars: one strong letter,
 * white on a deterministic coloured circle.
 */
export function ProfileAvatar({ name, color, size = 40, className = '', style }: AvatarProps) {
  const deterministic = AVATAR_COLORS[hashOf(name) % AVATAR_COLORS.length];
  return (
    <div
      className={`avatar${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        background: color || deterministic,
        fontSize: Math.round(size * 0.44),
        ...style,
      }}
      aria-hidden="true"
    >
      {firstLetter(name)}
    </div>
  );
}
