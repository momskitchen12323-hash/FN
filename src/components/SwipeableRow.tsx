import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface SwipeableRowProps {
  children: ReactNode;
  emailId: string;
  /** Swipe right reveals archive (green pill); swipe left reveals delete (red pill). */
  onArchive?: () => void;
  onDelete?: () => void;
  onLongPress?: () => void;
  /** When true the gesture layer is inert (e.g. during selection mode). */
  disabled?: boolean;
}

const THRESHOLD = 96;
const ENGAGE = 8;

/**
 * M3 Expressive swipe container: the row content drags horizontally while a
 * gooey colored pill grows behind it. A full swipe commits the action.
 */
export function SwipeableRow({
  children,
  emailId,
  onArchive,
  onDelete,
  onLongPress,
  disabled,
}: SwipeableRowProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [release, setRelease] = useState(false);
  const [pill, setPill] = useState<{ side: 'left' | 'right'; color: string; icon: string } | null>(null);
  const gesture = useRef<{ startX: number; startY: number; dx: number; engaged: boolean } | null>(null);
  const pressTimer = useRef<number | undefined>(undefined);
  const suppressClick = useRef(false);

  const clearPress = () => {
    window.clearTimeout(pressTimer.current);
    pressTimer.current = undefined;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    gesture.current = { startX: e.clientX, startY: e.clientY, dx: 0, engaged: false };
    setRelease(false);
    clearPress();
    pressTimer.current = window.setTimeout(() => {
      if (gesture.current && !gesture.current.engaged) {
        suppressClick.current = true;
        onLongPress?.();
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 300);
      }
    }, 480);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const absX = e.clientX - g.startX;
    const absY = e.clientY - g.startY;
    if (!g.engaged) {
      if (Math.abs(absY) > 12 && Math.abs(absX) < Math.abs(absY)) {
        clearPress();
        gesture.current = null;
        return;
      }
      if (Math.abs(absX) > ENGAGE) {
        g.engaged = true;
        setEngaged(true);
        clearPress();
      } else {
        return;
      }
    }
    g.dx = Math.max(-260, Math.min(260, absX));
    setDx(g.dx);
    setPill(
      g.dx > THRESHOLD * 0.45
        ? { side: onArchive ? 'left' : 'right', color: 'var(--green)', icon: 'archive' }
        : g.dx < -THRESHOLD * 0.45
          ? { side: onDelete ? 'right' : 'left', color: 'var(--red)', icon: 'delete' }
          : null,
    );
  };

  const finish = () => {
    const g = gesture.current;
    gesture.current = null;
    clearPress();
    if (!g || !g.engaged) {
      setEngaged(false);
      setDx(0);
      setPill(null);
      return;
    }
    const dx = g.dx;
    const commit = dx > THRESHOLD ? 'archive' : dx < -THRESHOLD ? 'delete' : null;
    if (commit === 'archive' && onArchive) {
      setPill({ side: 'left', color: 'var(--green)', icon: 'archive' });
      onArchive();
      return;
    }
    if (commit === 'delete' && onDelete) {
      setPill({ side: 'right', color: 'var(--red)', icon: 'delete' });
      onDelete();
      return;
    }
    setRelease(true);
    setDx(0);
    window.setTimeout(() => {
      setRelease(false);
      setEngaged(false);
      setPill(null);
    }, 280);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const pillWidth = pill ? Math.min(Math.abs(dx) - 4, 300) : 48;

  return (
    <div
      className="swipe-wrap"
      ref={wrapRef}
      data-email={emailId}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={finish}
      onPointerLeave={engaged ? finish : undefined}
      onClickCapture={onClickCapture}
    >
      {pill && (
        <span
          className={`swipe-pill swipe-pill--on swipe-pill--${pill.side}`}
          style={{ width: pillWidth, backgroundColor: pill.color }}
        >
          <MaterialIcon name={pill.icon} size={22} filled />
        </span>
      )}
      <div
        className={`swipe-content${release ? ' swipe-content--release' : ''}`}
        style={disabled && dx === 0 ? undefined : { transform: `translateX(${dx}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
