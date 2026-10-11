import { useState } from 'react';
import type { Email } from '../types/email';
import { MaterialIcon } from './MaterialIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { ACCOUNT, ACCOUNT_COLOR } from '../data/emails';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  onToggleStar: (id: string) => void;
  onArchive: (email: Email) => void;
  onDelete: (email: Email) => void;
  onMarkUnread: (email: Email) => void;
  onStatic: (label: string) => void;
}

const MENU_ITEMS: { icon: string; label: string }[] = [
  { icon: 'report', label: 'Report spam' },
  { icon: 'print', label: 'Print all' },
  { icon: 'add_task', label: 'Add to Tasks' },
];

/**
 * Full-screen message reading view: action toolbar, subject with star,
 * sender row, real message body and the Reply / Reply all / Forward area.
 * No bottom Mail/Meet navigation here, matching Gmail's message screen.
 */
export function EmailDetail({ email, onBack, onToggleStar, onArchive, onDelete, onMarkUnread, onStatic }: EmailDetailProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const isSent = email.folder === 'sent';
  const senderName = isSent ? ACCOUNT.name : email.fromName;
  const senderColor = isSent ? ACCOUNT_COLOR : email.avatarColor;
  const subtitle = isSent ? `to ${email.toName}` : 'to me';

  return (
    <div className="detail">
      <header className="detail-toolbar">
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}>
          <MaterialIcon name="arrow_back" className="icon-secondary" />
        </button>
        <div className="detail-toolbar__spacer" />
        <button type="button" className="icon-btn" aria-label="Archive" onClick={() => onArchive(email)}>
          <MaterialIcon name="archive" className="icon-secondary" />
        </button>
        <button type="button" className="icon-btn" aria-label="Delete" onClick={() => onDelete(email)}>
          <MaterialIcon name="delete" className="icon-secondary" />
        </button>
        <button type="button" className="icon-btn" aria-label="Mark as unread" onClick={() => onMarkUnread(email)}>
          <MaterialIcon name="mark_email_unread" className="icon-secondary" />
        </button>
        <button type="button" className="icon-btn" aria-label="More options" onClick={() => setMenuOpen((v) => !v)}>
          <MaterialIcon name="more_vert" className="icon-secondary" />
        </button>
      </header>

      {menuOpen && (
        <>
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 44, background: 'transparent' }}
            onClick={() => setMenuOpen(false)}
          />
          <div className="menu-pop" role="menu" aria-label="More options">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className="menu-pop__item"
                onClick={() => {
                  setMenuOpen(false);
                  onStatic(item.label);
                }}
              >
                <MaterialIcon name={item.icon} size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <main className="detail-scroll no-scrollbar">
        <div className="detail-subject-row">
          <h1 className="detail-subject">{email.subject}</h1>
          <button
            type="button"
            className={`star-btn${email.starred ? ' star-btn--on' : ''}`}
            aria-label={email.starred ? 'Remove star' : 'Add star'}
            aria-pressed={email.starred}
            onClick={() => onToggleStar(email.id)}
          >
            <MaterialIcon name="star" size={22} filled={email.starred} />
          </button>
        </div>

        <div className="detail-sender">
          <ProfileAvatar name={senderName} color={senderColor} size={40} />
          <div className="detail-sender__meta">
            <span className="detail-sender__name">{senderName}</span>
            <span className="detail-sender__to">
              {subtitle}
              <MaterialIcon name="expand_more" size={16} />
            </span>
          </div>
          <span className="detail-sender__date">{email.fullDate}</span>
        </div>

        <div className="detail-body">
          {email.body.split(/\n{2,}/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="detail-actions">
          <button type="button" className="detail-action" onClick={() => onStatic('Reply')}>
            <MaterialIcon name="reply" size={18} />
            Reply
          </button>
          <button type="button" className="detail-action" onClick={() => onStatic('Reply all')}>
            <MaterialIcon name="reply_all" size={18} />
            Reply all
          </button>
          <button type="button" className="detail-action" onClick={() => onStatic('Forward')}>
            <MaterialIcon name="forward" size={18} />
            Forward
          </button>
        </div>
      </main>
    </div>
  );
}
