import type { Email } from '../types/email';
import { ProfileAvatar } from './ProfileAvatar';
import { MaterialIcon } from './MaterialIcon';

interface EmailRowProps {
  email: Email;
  /** Name shown in the first line (sender for inbox, recipient for sent). */
  displayName: string;
  onOpen: () => void;
  onToggleStar: () => void;
}

const TYPE_ICON: Record<string, string> = {
  pdf: 'picture_as_pdf',
  image: 'image',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
};

function chipIcon(type?: string, name = ''): string {
  const t = (type || '').toLowerCase();
  if (TYPE_ICON[t]) return TYPE_ICON[t];
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (TYPE_ICON[ext]) return TYPE_ICON[ext];
  return 'attach_file';
}

/**
 * One Gmail list row: avatar, sender/recipient, subject with snippet appended,
 * attachment chips, date and star.
 */
export function EmailRow({ email, displayName, onOpen, onToggleStar }: EmailRowProps) {
  const open = () => onOpen();
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

  const chips = email.attachments || [];
  const visibleChips = chips.slice(0, 3);
  const extra = chips.length - visibleChips.length;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`email-row${email.unread ? ' email-row--unread' : ''}`}
      onClick={open}
      onKeyDown={onKeyDown}
      aria-label={`${email.unread ? 'Unread' : 'Read'} email from ${displayName}: ${email.subject}`}
    >
      <ProfileAvatar name={displayName} color={email.avatarColor} size={40} />
      <div className="email-row__body">
        <div className="email-row__line1">
          <span className="email-row__sender">{displayName}</span>
          <span className="email-row__date">{email.date}</span>
        </div>
        <div className="email-row__line2">
          <p className="email-row__subject-snippet">
            <span className="email-row__subject">{email.subject}</span>
            {' – '}
            <span className="email-row__snippet">{email.snippet}</span>
          </p>
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
            <MaterialIcon name="star" size={20} filled={email.starred} />
          </button>
        </div>
        {visibleChips.length > 0 && (
          <div className="email-row__chips">
            {visibleChips.map((a) => (
              <span key={a.name} className="att-chip">
                <span className="att-chip__icon">
                  <MaterialIcon name={chipIcon(a.type, a.name)} size={14} />
                  <span className="att-chip__badge">{(a.type || a.name.split('.').pop() || '').toUpperCase().slice(0, 3)}</span>
                </span>
                <span className="att-chip__name">{a.name}</span>
              </span>
            ))}
            {extra > 0 && <span className="att-chip att-chip--more">+{extra}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
