import { useRef, useState } from 'react';
import type { Email, ThreadMessage } from '../types/email';
import { MaterialIcon } from './MaterialIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { BottomNav } from './BottomNav';
import { useScrollHide } from '../hooks/lists';
import { parseStamp, longAgo } from '../utils/format';
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

function attachmentKind(name: string): 'pdf' | 'image' | 'file' {
  const ext = (name || '').split('.').pop()?.toLowerCase() || '';
  if (PDF_EXT.has(ext)) return 'pdf';
  if (IMAGE_EXT.has(ext)) return 'image';
  return 'file';
}

/** Full-screen reading view, Gmail 2025/26 (M3 Expressive) style. */
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
  const [expandedIndex, setExpandedIndex] = useState<number>(-1); // -1 = last message
  const [addrOpen, setAddrOpen] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef<HTMLElement>(null);
  const navHidden = useScrollHide(scrollRef);

  const thread: ThreadMessage[] = email.messages.length > 0
    ? email.messages
    : [{
        fromName: email.fromName,
        fromEmail: email.fromEmail,
        date: email.fullDate,
        body: '',
        attachments: [],
      }];

  const activeIndex = expandedIndex === -1 ? thread.length - 1 : expandedIndex;
  const collapsed = thread.filter((_, i) => i !== activeIndex).slice(0, activeIndex);
  // Expanded message: chosen one (or last).
  const active: ThreadMessage = thread[activeIndex];  const openName = active.fromName || (email.folder === 'sent' ? ACCOUNT.name : email.fromName);
  const avatarColor = active.avatarBg || email.avatarColor || ACCOUNT_COLOR;
  const toLine = email.folder === 'sent' ? `to ${email.toName}` : 'to me';
  const dateStamp = active.date || email.fullDate || '';
  const parsedDate = parseStamp(dateStamp);
  const dateLine = parsedDate ? longAgo(parsedDate) : dateStamp.replace(/,/, ',');
  const attachments =
    active.attachments && active.attachments.length > 0 ? active.attachments : email.attachments || [];
  const folderLabel = email.folder === 'sent' ? 'Sent' : FOLDER_LABEL[email.category];
  const showUnsubscribe = email.category === 'promotions';
  // "Reply all" only when the thread has more than one distinct participant.
  const participants = new Set(thread.map((m) => m.fromEmail || m.fromName));
  const showReplyAll = participants.size > 1 || (email.folder === 'sent' && thread.length > 1);

  const sendInlineReply = () => {
    setReplyOpen(false);
    setReplyText('');
    onStatic('Demo only — nothing was sent');
  };

  return (
    <div className="screen detail">
      <header className="detail-toolbar">
        <button type="button" className="icon-btn ripplable" aria-label="Back" onClick={onBack}>
          <MaterialIcon name="arrow_back" />
        </button>
        <div className="detail-toolbar__spacer" />
        <button type="button" className="icon-btn ripplable" aria-label="Archive" onClick={() => onArchive(email)}>
          <MaterialIcon name="archive" />
        </button>
        <button type="button" className="icon-btn ripplable" aria-label="Delete" onClick={() => onDelete(email)}>
          <MaterialIcon name="delete" />
        </button>
        <button type="button" className="icon-btn ripplable" aria-label="Mark as unread" onClick={() => onMarkUnread(email)}>
          <MaterialIcon name="mark_as_unread" />
        </button>
        <button type="button" className="icon-btn ripplable" aria-label="More options" onClick={() => setMenuOpen((v) => !v)}>
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
                className="menu-pop__item ripplable"
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

      <main className="detail-scroll no-scrollbar" ref={scrollRef}>
        <div className="detail-subject-row">
          <h1 className="detail-subject">
            {email.subject}
            <span className="detail-folder-chip">{folderLabel}</span>
          </h1>
          <button
            type="button"
            className={`star-btn ripplable${email.starred ? ' star-btn--on' : ''}`}
            aria-label={email.starred ? 'Remove star' : 'Add star'}
            aria-pressed={email.starred}
            onClick={() => onToggleStar(email.id)}
          >
            <MaterialIcon name="star" size={22} filled={email.starred} />
          </button>
        </div>

        {collapsed.map((m, i) => {
          const threadIndex = i;
          return (
            <button
              key={threadIndex}
              type="button"
              className="thread-mini ripplable"
              onClick={() => {
                setExpandedIndex(threadIndex);
                setReplyOpen(false);
                scrollRef.current?.scrollTo({ top: 0 });
              }}
              aria-label={`Expand message from ${m.fromName}`}
            >
              <ProfileAvatar name={m.fromName} color={m.avatarBg || email.avatarColor} size={34} />
              <div className="thread-mini__body">
                <span className="thread-mini__name">{m.fromName}</span>
                <span className="thread-mini__preview">{m.body ? m.body.slice(0, 160) : m.date}</span>
              </div>
              <span className="thread-mini__date">{m.date ? m.date.split(' at ')[0].replace(/, .*$/, '') : ''}</span>
            </button>
          );
        })}
        <div className="message-card">
          <div className="message-head">
            <ProfileAvatar name={openName} color={avatarColor} size={40} />
            <div className="message-meta">
              <div className="message-name-row">
                <span className="message-name">{openName}</span>
                <span className="message-date">{dateLine}</span>
              </div>
              <button type="button" className="message-to" aria-label="Show message details" onClick={() => setAddrOpen((v) => !v)}>
                {toLine}
                <MaterialIcon name="expand_more" size={16} />
              </button>
            </div>
            {showUnsubscribe && (
              <button type="button" className="msg-unsub" onClick={() => onStatic('Unsubscribe — demo only')}>
                Unsubscribe
              </button>
            )}
            <div className="message-actions">
              <button type="button" className="icon-btn ripplable" aria-label="Add reaction" onClick={() => onStatic('Add reaction')}>
                <MaterialIcon name="mood" size={20} />
              </button>
              <button type="button" className="icon-btn ripplable" aria-label="Reply" onClick={() => setReplyOpen(true)}>
                <MaterialIcon name="reply" size={20} />
              </button>
              <button type="button" className="icon-btn ripplable" aria-label="Message options" onClick={() => onStatic('Message options')}>
                <MaterialIcon name="more_vert" size={20} />
              </button>
            </div>
          </div>

          {addrOpen && (
            <div className="addr-pop" role="dialog" aria-label="Message details">
              <button type="button" className="icon-btn addr-pop__close" aria-label="Close details" onClick={() => setAddrOpen(false)}>
                <MaterialIcon name="close" size={18} />
              </button>
              <div className="addr-pop__row">
                <span className="addr-pop__label">From:</span>
                <span className="addr-pop__value">{email.folder === 'sent' ? ACCOUNT.email : active.fromEmail || openName}</span>
              </div>
              <div className="addr-pop__row">
                <span className="addr-pop__label">To:</span>
                <span className="addr-pop__value">{email.folder === 'sent' ? email.toEmail || email.toName : ACCOUNT.email}</span>
              </div>
              <div className="addr-pop__row">
                <span className="addr-pop__label">Date:</span>
                <span className="addr-pop__value">{dateStamp}</span>
              </div>
            </div>
          )}

          {attachments.length > 0 && (
            <div className="message-attachments" aria-label={`${attachments.length} attachments`}>
              {attachments.map((a, i) => {
                const kind = attachmentKind(a.name);
                return (
                  <div key={i} className="att-card">
                    <span className={`att-card__thumb${kind === 'pdf' ? ' att-card__thumb--pdf' : ''}${kind === 'image' ? ' att-card__thumb--img' : ''}`}>
                      <MaterialIcon
                        name={kind === 'pdf' ? 'picture_as_pdf' : kind === 'image' ? 'image' : 'draft'}
                        size={20}
                      />
                    </span>
                    <span className="att-card__name" title={a.name}>{a.name}</span>
                    {a.size && <span className="att-card__size">{a.size}</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div className="message-body">
            {(active.body || '').split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </main>

      {replyOpen ? (
        <div className="inline-reply">
          <textarea
            rows={1}
            autoFocus
            placeholder="Reply"
            aria-label="Reply"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendInlineReply();
              }
              if (e.key === 'Escape') setReplyOpen(false);
            }}
          />
          <button type="button" className="icon-btn ripplable" aria-label="Close reply" onClick={() => setReplyOpen(false)}>
            <MaterialIcon name="close" size={20} />
          </button>
          <button type="button" className="inline-reply__send ripplable" aria-label="Send reply" onClick={sendInlineReply}>
            <MaterialIcon name="send" size={20} filled className="icon-ink" />
          </button>
        </div>
      ) : (
        <div className="reply-dock">
          <button type="button" className="reply-pill ripplable" onClick={() => setReplyOpen(true)}>
            <MaterialIcon name="reply" size={18} />
            Reply
          </button>
          {showReplyAll && (
            <button type="button" className="reply-pill ripplable" onClick={() => onStatic('Reply all')}>
              <MaterialIcon name="reply_all" size={18} />
              Reply all
            </button>
          )}
          <button type="button" className="reply-pill ripplable" onClick={() => onStatic('Forward')}>
            <MaterialIcon name="forward" size={18} />
            Forward
          </button>
          <button type="button" className="reply-pill reply-pill--emoji ripplable" aria-label="Add reaction" onClick={() => onStatic('Add reaction')}>
            <MaterialIcon name="mood" size={20} />
          </button>
        </div>
      )}

      <BottomNav active="mail" inboxUnread={inboxUnread} hidden={navHidden} />
    </div>
  );
}
