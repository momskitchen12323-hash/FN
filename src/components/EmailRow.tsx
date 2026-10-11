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

/**
 * One Gmail list row: avatar, sender/recipient, subject with snippet appended,
 * date and star. The star is a real button nested inside a role="button" row;
 * it stops propagation so it never opens the message.
 */
export function EmailRow({ email, displayName, onOpen, onToggleStar }: EmailRowProps) {
  const open = () => onOpen();
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  };

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
      </div>
    </div>
  );
}
