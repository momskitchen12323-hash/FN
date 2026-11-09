import type { Email } from '../types/email';
import { ProfileAvatar } from './ProfileAvatar';
import { MaterialIcon } from './MaterialIcon';
import { rowDate } from '../utils/format';

interface EmailRowProps {
  email: Email;
  /** Sender for inbox rows, "To: name" for sent rows. */
  displayName: string;
  onOpen: () => void;
  onToggleStar: () => void;
  /** Optional folder chip rendered after the subject (search results). */
  chipLabel?: string;
  selection?: {
    mode: boolean;
    selected: boolean;
    onToggle: () => void;
  };
}

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'heic']);
const PDF_EXT = new Set(['pdf']);

function chipIcon(name?: string): string {
  const ext = (name || '').split('.').pop()?.toLowerCase() || '';
  if (PDF_EXT.has(ext)) return 'picture_as_pdf';
  if (IMAGE_EXT.has(ext)) return 'image';
  return 'attach_file';
}

/**
 * Gmail M3 Expressive list row:
 *   [avatar|✓] sender (N) ...... date
 *              subject [chip]   star
 *              snippet
 *              attachment chips
 */
export function EmailRow({
  email,
  displayName,
  onOpen,
  onToggleStar,
  chipLabel,
  selection,
}: EmailRowProps) {
  const chips = email.attachments || [];
  const visibleChips = chips.slice(0, 2);
  const extra = chips.length - visibleChips.length;
  const threadCount = email.messages.length > 1 ? ` (${email.messages.length})` : '';
  const selecting = selection?.mode ?? false;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`email-row ripplable${email.unread ? ' email-row--unread' : ''}`}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      aria-label={`${email.unread ? 'Unread' : 'Read'} email from ${displayName}: ${email.subject}`}
    >
      {selecting ? (
        <button
          type="button"
          className={`sel-check${selection?.selected ? ' sel-check--on' : ''}`}
          aria-label={selection?.selected ? 'Deselect email' : 'Select email'}
          aria-pressed={selection?.selected}
          onClick={(e) => {
            e.stopPropagation();
            selection?.onToggle();
          }}
        >
          <MaterialIcon name="check" size={20} filled={selection?.selected} />
        </button>
      ) : (
        <ProfileAvatar name={displayName} size={40} style={{ marginTop: 1 }} />
      )}
      <div className="email-row__body">
        <span className="email-row__sender">
          {displayName}
          {threadCount}
        </span>
        <span className="email-row__subject">
          {email.subject}
          {chipLabel && <span className="row-chip">{chipLabel}</span>}
        </span>
        <span className="email-row__snippet">{email.snippet}</span>
        {visibleChips.length > 0 && (
          <div className="email-row__chips">
            {visibleChips.map((a) => (
              <span key={a.name} className="att-chip">
                <MaterialIcon name={chipIcon(a.name)} size={14} />
                <span className="att-chip__name">{a.name}</span>
              </span>
            ))}
            {extra > 0 && <span className="att-chip att-chip--more">+{extra}</span>}
          </div>
        )}
      </div>
      <div className="email-row__side">
        <span className="email-row__date">{rowDate(email)}</span>
        <button
          type="button"
          className={`star-btn ripplable${email.starred ? ' star-btn--on' : ''}`}
          aria-label={email.starred ? 'Remove star' : 'Add star'}
          aria-pressed={email.starred}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
        >
          <MaterialIcon name="star" size={22} filled={email.starred} />
        </button>
      </div>
    </div>
  );
}
