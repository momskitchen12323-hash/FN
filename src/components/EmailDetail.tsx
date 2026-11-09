import { useMemo, useRef, useState } from 'react';
import type { Email, ThreadMessage } from '../types/email';
import { MaterialIcon } from './MaterialIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { BottomNav } from './BottomNav';
import { useScrollHide } from '../hooks/lists';
import { parseStamp, longAgo, compactStamp, splitQuotedBody, toParagraphs } from '../utils/format';
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

/** One-line thread preview; quoted history is excluded like Gmail. */
function threadPreview(body: string): string {
  const { visible } = splitQuotedBody(body);
  const line = visible.trim().split('\n').find((l) => l.trim()) || '';
  return line.slice(0, 160);
}

const LINK_RE = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

/** Soft photographic placeholders for image attachments (bytes aren't in the snapshot). */
const IMAGE_GRADIENTS = [
  'linear-gradient(135deg, #cfe3f7 0%, #e8f0fb 55%, #f7f9fc 100%)',
  'linear-gradient(135deg, #f5e3cf 0%, #faf0e4 60%, #f8f9fb 100%)',
  'linear-gradient(135deg, #d5ead9 0%, #ecf5ee 60%, #f8faf9 100%)',
  'linear-gradient(135deg, #e3d8f3 0%, #f1ecf9 60%, #f9f8fc 100%)',
];

function imageGradient(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return IMAGE_GRADIENTS[h % IMAGE_GRADIENTS.length];
}

/** Gmail auto-links URLs and emails inside plain-text bodies. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(LINK_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (/^(https?:\/\/|www\.)/.test(part)) {
          return (
            <a
              key={i}
              className="msg-link"
              href={part.startsWith('http') ? part : `https://${part}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              {part}
            </a>
          );
        }
        if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(part)) {
          return (
            <a key={i} className="msg-link" href={`mailto:${part}`}>
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
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
  const [quoteOpen, setQuoteOpen] = useState(false);
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
  const before = thread.slice(0, activeIndex);
  const after = thread.slice(activeIndex + 1);
  // Expanded message: chosen one (or last).
  const active: ThreadMessage = thread[activeIndex];
  const openName = active.fromName || (email.folder === 'sent' ? ACCOUNT.name : email.fromName);
  // Message avatars use the generated palette per sender (Gmail varies colours
  // per participant); only the account itself falls back to its brand colour.
  const avatarColor = active.avatarBg || (active.fromName ? undefined : ACCOUNT_COLOR);
  const toLine = active.toName
    ? `to ${active.toName}`
    : email.folder === 'sent'
      ? `to ${email.toName}`
      : 'to me';
  const dateStamp = active.date || email.fullDate || '';
  const parsedDate = parseStamp(dateStamp);
  const dateLine = parsedDate ? longAgo(parsedDate) : dateStamp.replace(/,/, ',');
  const attachments =
    thread.length > 1
      ? active.attachments || []
      : active.attachments && active.attachments.length > 0
        ? active.attachments
        : email.attachments || [];
  const folderLabel = email.folder === 'sent' ? 'Sent' : FOLDER_LABEL[email.category];
  const showUnsubscribe = email.category === 'promotions';
  // "Reply all" only when the thread has more than one distinct participant.
  const participants = new Set(thread.map((m) => m.fromEmail || m.fromName));
  const showReplyAll = participants.size > 1 || (email.folder === 'sent' && thread.length > 1);

  const body = active.body || '';
  const { visible, quoted } = useMemo(() => splitQuotedBody(body), [body]);
  const visibleParas = useMemo(() => toParagraphs(visible), [visible]);
  const quotedParas = useMemo(() => toParagraphs(quoted), [quoted]);

  const sendInlineReply = () => {
    setReplyOpen(false);
    setReplyText('');
    onStatic('Demo only — nothing was sent');
  };

  const renderMini = (m: ThreadMessage, idx: number) => (
    <button
      key={idx}
      type="button"
      className="thread-mini ripplable"
      onClick={() => {
        setExpandedIndex(idx);
        setReplyOpen(false);
        setQuoteOpen(false);
        scrollRef.current?.scrollTo({ top: 0 });
      }}
      aria-label={`Expand message from ${m.fromName}`}
    >
      <ProfileAvatar name={m.fromName} color={m.avatarBg} size={34} />
      <div className="thread-mini__body">
        <span className="thread-mini__name">{m.fromName}</span>
        <span className="thread-mini__preview">{m.body ? threadPreview(m.body) : m.date}</span>
      </div>
      <span className="thread-mini__date">{compactStamp(m.date)}</span>
    </button>
  );

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

        {before.map((m, i) => renderMini(m, i))}
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
                <span className="addr-pop__value">
                  {active.fromEmail || (email.folder === 'sent' ? ACCOUNT.email : openName)}
                </span>
              </div>
              <div className="addr-pop__row">
                <span className="addr-pop__label">To:</span>
                <span className="addr-pop__value">
                  {active.toEmail ||
                    (email.folder === 'sent' ? email.toEmail || email.toName : ACCOUNT.email)}
                </span>
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
                if (kind === 'image') {
                  return (
                    <button
                      key={i}
                      type="button"
                      className="att-image ripplable"
                      aria-label={`Open attachment ${a.name}`}
                      onClick={() => onStatic(`Open ${a.name} — demo only`)}
                    >
                      <span
                        className="att-image__preview"
                        style={{ background: imageGradient(a.name) }}
                        aria-hidden="true"
                      >
                        <MaterialIcon name="image" size={24} />
                      </span>
                      <span className="att-image__meta">
                        <span className="att-image__name" title={a.name}>{a.name}</span>
                        {a.size && <span className="att-image__size">{a.size}</span>}
                      </span>
                    </button>
                  );
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className="att-file ripplable"
                    aria-label={`Open attachment ${a.name}`}
                    onClick={() => onStatic(`Open ${a.name} — demo only`)}
                  >
                    <span className={`att-file__thumb att-file__thumb--${kind}`}>
                      <MaterialIcon name={kind === 'pdf' ? 'picture_as_pdf' : 'draft'} size={24} />
                    </span>
                    <span className="att-file__meta">
                      <span className="att-file__name" title={a.name}>{a.name}</span>
                      <span className="att-file__size">{a.size || (kind === 'pdf' ? 'PDF' : 'File')}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="message-body">
            {visibleParas.map((para, i) => (
              <p key={i}>
                <Linkified text={para} />
              </p>
            ))}
            {quotedParas.length > 0 &&
              (quoteOpen ? (
                <div className="message-quote">
                  {quotedParas.map((para, i) => (
                    <p key={i}>
                      <Linkified text={para} />
                    </p>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  className="quote-toggle ripplable"
                  aria-label="Show trimmed content"
                  onClick={() => setQuoteOpen(true)}
                >
                  <MaterialIcon name="more_horiz" size={20} />
                </button>
              ))}
          </div>
        </div>
        {after.map((m, i) => renderMini(m, activeIndex + 1 + i))}
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
