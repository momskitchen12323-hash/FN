import type { CSSProperties, MouseEventHandler } from 'react';

interface MaterialIconProps {
  /** Material Symbols Rounded ligature name, e.g. "menu". */
  name: string;
  size?: number;
  filled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Accessible label; when omitted the icon is treated as decorative. */
  label?: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
}

/**
 * Renders a Material Symbols Rounded ligature glyph. The variable axes are set
 * inline so filled/outlined variants share a single font file.
 */
export function MaterialIcon({
  name,
  size = 24,
  filled = false,
  className = '',
  style,
  label,
  onClick,
}: MaterialIconProps) {
  return (
    <span
      className={`msr${filled ? ' msr--filled' : ''}${className ? ` ${className}` : ''}`}
      style={{
        fontSize: size,
        width: size,
        height: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
      aria-hidden={label ? undefined : true}
      aria-label={label ?? undefined}
      role={label ? 'img' : undefined}
      onClick={onClick}
    >
      {name}
    </span>
  );
}
