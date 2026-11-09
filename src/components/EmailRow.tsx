import type { Email } from '../types/email';
import { ProfileAvatar } from './ProfileAvatar';
import { MaterialIcon } from './MaterialIcon';

interface EmailRowProps {
  email: Email;
  /** Sender for inbox rows, "To: name" for sent rows. */
  displayName: string;
  onOpen: () => void;
  onToggleStar: () => void;
}

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'heic']);
const PDF_EXT = new Set(['pdf']);

function chipIcon(name?: string): string {
  const ext = (name || '').split('.').pop()?.toLowerCase() || '';
  if (PDF_EXT.has(ext)) return 'picture_as_pdf';
  if (IMAGE_EXT.has(ext)) return 'image';
  return 'attach_file';
}

/** Compact row date; blanks out placeholder dashes and shortens verbose stamps. */
function rowDate(email: Email): string {
  const raw = (email.date || email.fullDate || '').trim();
  if (!raw || raw === '\u2014' || raw === '\u2013' || raw === '-') return '';
  const m = raw.match(/(\d{1,2}) ([A-Za-z]+) (\d{4})/);
  if (!m) return raw.split(',')[0];
  const short = `${m[1]} ${m[2].slice(0, 3)}`;
  return m[3] === String(new Date().getFullYear()) ? short : `${short} ${m[3]}`;
}

/**
 * Gmail 2026 list row:
 *   [avatar] sender ........ date
 *            subject        star
 *            snippet
 *            attachment chips
 */
export function EmailRow({ email, displayName, onOpen, onToggleStar }: EmailRowProps) {
  const chips = email.attachments || [];
  const visibleChips = chips.slice(0, 2);
  const extra = chips.length - visibleChips.length;

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
      className={`email-row${email.unread ? ' email-row--unread' : ''}`}
      onClick={onOpen}
      onKeyDown={onKeyDown}
      aria-label={`${email.unread ? 'Unread' : 'Read'} email from ${displayName}: ${email.subject}`}
    >
      <ProfileAvatar name={displayName} size={40} style={{ marginTop: 1 }} />
      <div className="email-row__body">
        <span className="email-row__sender">{displayName}</span>
        <span className="email-row__subject">{email.subject}</span>
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
          className={`star-btn${email.starred ? ' star-btn--on' : ''}`}
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
