/**
 * Material ripple, applied globally. Any element with the `ripplable` class
 * (or interactive elements inside one) spawns a ink circle on pointerdown.
 */
export function installRipples(): () => void {
  if (typeof document === 'undefined') return () => undefined;

  const onDown = (event: PointerEvent) => {
    const target = (event.target as HTMLElement | null)?.closest(
      '.ripplable',
    ) as HTMLElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const span = document.createElement('span');
    span.className = 'ripple-ink';
    span.style.width = `${size}px`;
    span.style.height = `${size}px`;
    span.style.left = `${event.clientX - rect.left - size / 2}px`;
    span.style.top = `${event.clientY - rect.top - size / 2}px`;
    target.appendChild(span);
    window.setTimeout(() => span.remove(), 600);
  };

  document.addEventListener('pointerdown', onDown, { passive: true });
  document.documentElement.classList.add('ripples-on');
  return () => {
    document.removeEventListener('pointerdown', onDown);
    document.documentElement.classList.remove('ripples-on');
  };
}
