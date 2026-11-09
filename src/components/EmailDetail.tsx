import { useState } from 'react';
import type { Email, ThreadMessage } from '../types/email';
import { MaterialIcon } from './MaterialIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { BottomNav } from './BottomNav';
import { ACCOUNT, ACCOUNT_COLOR } from '../data/emails';

interface EmailDetailProps {
  email: Email;
  /** Live unread count for the Mail tab badge on the floating nav. */
  inboxUnread: number;
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

const FOLDER_LABEL: Record<Email['category'], string> = {
  primary: 'Inbox',
  promotions: 'Promotions',
  social: 'Social',
  updates: 'Updates',
  none: 'Inbox',
};

const last = <T,>(arr: T[]): T => arr[arr.length - 1];

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'heic']);
const PDF_EXT = new Set(['pdf']);

function attachmentIcon(name: string): string {
  const ext = (name || '').split('.').pop()?.toLowerCase() || '';
  if (PDF_EXT.has(ext)) return 'picture_as_pdf';
  if (IMAGE_EXT.has(ext)) return 'image';
  return 'attach_file';
}

/** Full-screen reading view, Gmail 2026 (M3 Expressive) style. */
export function EmailDetail({
  email,
  inboxUnread,
  onBack,
  onToggleStar,
  onArchive,
  onDelete,
  onMarkUnread,
  onStatic,
}: EmailDetailProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const thread: ThreadMessage[] = email.messages.length > 0
    ? email.messages
    : [{
        fromName: email.fromName,
        fromEmail: email.fromEmail,
        date: email.fullDate,
        body: '',
        attachments: [],
      }];

  // The last message in the thread is the expanded one; everything above
  // renders as a collapsed mini row (like Gmail).
  const collapsed = thread.length > 1 ? thread.slice(0, -1) : [];
  const active: ThreadMessage = last(thread);
  const openName = active.fromName || (email.folder === 'sent' ? ACCOUNT.name : email.fromName);
  const avatarColor = active.avatarBg || email.avatarColor || ACCOUNT_COLOR;
  const toLine = email.folder === 'sent' ? `to ${email.toName}` : 'to me';
  const dateLine =
    active.date ||
    (email.fullDate || '').split(' at ')[0];
  const attachments =
    active.attachments && active.attachments.length > 0 ? active.attachments : email.attachments || [];
  const folderLabel = email.folder === 'sent' ? 'Sent' : FOLDER_LABEL[email.category];

  return (
    <div className="detail">
      <header className="detail-toolbar">
        <button type="button" className="icon-btn" aria-label="Back" onClick={onBack}>
          <MaterialIcon name="arrow_back" />
        </button>
        <div className="detail-toolbar__spacer" />
        <button type="button" className="icon-btn" aria-label="Archive" onClick={() => onArchive(email)}>
          <MaterialIcon name="archive" />
        </button>
        <button type="button" className="icon-btn" aria-label="Delete" onClick={() => onDelete(email)}>
          <MaterialIcon name="delete" />
        </button>
        <button type="button" className="icon-btn" aria-label="Mark as unread" onClick={() => onMarkUnread(email)}>
          <MaterialIcon name="mark_as_unread" />
        </button>
        <button type="button" className="icon-btn" aria-label="More options" onClick={() => setMenuOpen((v) => !v)}>
          <MaterialIcon name="more_vert" />
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
          <h1 className="detail-subject">
            {email.subject}
            <span className="detail-folder-chip">{folderLabel}</span>
          </h1>
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

        {collapsed.map((m, i) => (
          <div key={i} className="thread-mini">
            <ProfileAvatar name={m.fromName} color={m.avatarBg || email.avatarColor} size={34} />
            <div className="thread-mini__body">
              <span className="thread-mini__name">{m.fromName}</span>
              <span className="thread-mini__preview">{m.body ? m.body.slice(0, 160) : m.date}</span>
            </div>
            <span className="thread-mini__date">{m.date ? m.date.split(' at ')[0] : ''}</span>
          </div>
        ))}

        <div className="message-card">
          <div className="message-head">
            <ProfileAvatar name={openName} color={avatarColor} size={40} />
            <div className="message-meta">
              <div className="message-name-row">
                <span className="message-name">{openName}</span>
                <span className="message-date">{dateLine}</span>
              </div>
              <div className="message-to">
                {toLine}
                <MaterialIcon name="expand_more" size={16} />
              </div>
            </div>
            <div className="message-actions">
              <button type="button" className="icon-btn" aria-label="Add reaction" onClick={() => onStatic('Add reaction')}>
                <MaterialIcon name="mood" size={20} />
              </button>
              <button type="button" className="icon-btn" aria-label="Reply" onClick={() => onStatic('Reply')}>
                <MaterialIcon name="reply" size={20} />
              </button>
              <button type="button" className="icon-btn" aria-label="Message options" onClick={() => onStatic('Message options')}>
                <MaterialIcon name="more_vert" size={20} />
              </button>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="message-attachments" aria-label={`${attachments.length} attachments`}>
              {attachments.map((a, i) => (
                <div key={i} className="att-card">
                  <span className="att-card__icon">
                    <MaterialIcon name={attachmentIcon(a.name)} size={16} />
                  </span>
                  <span className="att-card__name" title={a.name}>{a.name}</span>
                  {a.size && <span className="att-card__size">{a.size}</span>}
                </div>
              ))}
            </div>
          )}

          <div className="message-body">
            {(active.body || '').split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </main>

      <div className="reply-dock">
        <button type="button" className="reply-pill" onClick={() => onStatic('Reply')}>
          <MaterialIcon name="reply" size={18} />
          Reply
        </button>
        <button type="button" className="reply-pill" onClick={() => onStatic('Reply all')}>
          <MaterialIcon name="reply_all" size={18} />
          Reply all
        </button>
        <button type="button" className="reply-pill" onClick={() => onStatic('Forward')}>
          <MaterialIcon name="forward" size={18} />
          Forward
        </button>
        <button type="button" className="reply-pill reply-pill--emoji" aria-label="Add reaction" onClick={() => onStatic('Add reaction')}>
          <MaterialIcon name="mood" size={20} />
        </button>
      </div>

      <BottomNav unreadCount={inboxUnread} />
    </div>
  );
}
