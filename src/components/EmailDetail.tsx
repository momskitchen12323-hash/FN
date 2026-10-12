import { useState } from 'react';
import type { Email, ThreadMessage } from '../types/email';
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

const last = <T,>(arr: T[]): T => arr[arr.length - 1];

/** Full-screen reading view with Gmail-style thread handling. */
export function EmailDetail({ email, onBack, onToggleStar, onArchive, onDelete, onMarkUnread, onStatic }: EmailDetailProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const thread = email.messages.length > 0 ? email.messages : [{
    fromName: email.fromName,
    fromEmail: email.fromEmail,
    date: email.fullDate,
    body: '',
    attachments: [],
  }];

  // The last message in the thread is the expanded one; everything above renders collapsed (like Gmail).
  const collapsed = thread.length > 1 ? thread.slice(0, -1) : [];
  const active: ThreadMessage = last(thread);
  const openName = active.fromName || (email.folder === 'sent' ? ACCOUNT.name : email.fromName);
  const openAvatarColor = active.avatarBg || email.avatarColor;
  const toLine = email.folder === 'sent' ? `to ${email.toName}` : 'to me';
  const attachments = (active.attachments && active.attachments.length > 0) ? active.attachments : (email.attachments || []);

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

        {collapsed.length > 0 && (
          <div className="detail-nmsg-row">
            <span className="detail-nmsg">{collapsed.length} older message{collapsed.length === 1 ? '' : 's'}</span>
            <span className="detail-nmsg__line" />
          </div>
        )}

        {collapsed.map((m, i) => (
          <div key={i} className="detail-mini">
            <ProfileAvatar name={m.fromName} color={m.avatarBg || '#a4c2f4'} size={32} />
            <div className="detail-mini__meta">
              <span className="detail-mini__name">{m.fromName}</span>
              <span className="detail-mini__preview">{m.body ? m.body.slice(0, 160) : m.date}</span>
            </div>
            <span className="detail-mini__date">{m.date ? m.date.split(' at ')[0] : ''}</span>
          </div>
        ))}

        <div className="detail-sender">
          <ProfileAvatar name={openName} color={openAvatarColor} size={40} />
          <div className="detail-sender__meta">
            <span className="detail-sender__name">{openName}</span>
            <span className="detail-sender__to">
              {toLine}
              <MaterialIcon name="expand_more" size={16} />
            </span>
          </div>
          <span className="detail-sender__date">{active.date || email.fullDate}</span>
        </div>

        {attachments.length > 0 && (
          <div className="detail-attachments" aria-label={`${attachments.length} attachments`}>
            <span className="detail-attachments__title">
              {attachments.length} attachment{attachments.length === 1 ? '' : 's'}
            </span>
            <div className="detail-attachments__row">
              {attachments.map((a, i) => (
                <div key={i} className="att-card">
                  <div className="att-card__badge">{(a.type || 'FILE').slice(0, 3).toUpperCase()}</div>
                  <div className="att-card__name" title={a.name}>{a.name}</div>
                  {a.size && <div className="att-card__size">{a.size}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detail-body">
          {(active.body || '').split(/\n{2,}/).map((para, i) => (
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
