import { useMemo, useState } from 'react';
import type { Draft } from '../types/email';
import { MaterialIcon } from './MaterialIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { ACCOUNT } from '../data/emails';

interface ComposeScreenProps {
  /** Existing draft being resumed. */
  initial?: Draft | null;
  onClose: () => void;
  /** Demo "send": snackbar + close; no real email leaves the app. */
  onSend: (draft: Draft) => void;
  /** Called on back when content is non-empty: upserts the draft. */
  onSaveDraft: (draft: Draft) => void;
  onStatic?: (label: string) => void;
}

const BOTTOM_ACTIONS: { icon: string; label: string }[] = [
  { icon: 'attach_file', label: 'Attach file' },
  { icon: 'image', label: 'Insert photo' },
  { icon: 'photo_camera', label: 'Camera' },
  { icon: 'link', label: 'Insert link' },
  { icon: 'calendar_month', label: 'Insert event' },
  { icon: 'format_color_text', label: 'Formatting options' },
];

function splitRecipients(text: string): string[] {
  return text.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
}

/**
 * Full-screen Gmail Compose: title-less tinted top bar (back / attach /
 * filled send / overflow), From row, chip-style recipients, Cc/Bcc, Subject
 * and the bare body editor, with the attachment/formatting toolbar at the
 * bottom. Back saves a draft; nothing is ever transmitted.
 */
export function ComposeScreen({ initial, onClose, onSend, onSaveDraft, onStatic }: ComposeScreenProps) {
  const initialToItems = useMemo(() => splitRecipients(initial?.to || ''), [initial?.to]);
  const [toItems, setToItems] = useState<string[]>(initialToItems);
  const [toText, setToText] = useState('');
  const [cc, setCc] = useState(initial?.cc || '');
  const [bcc, setBcc] = useState(initial?.bcc || '');
  const [subject, setSubject] = useState(initial?.subject || '');
  const [body, setBody] = useState(initial?.body || '');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const draftId = initial?.id;
  const dirty =
    toItems.length > 0 ||
    toText.trim().length > 0 ||
    cc.trim().length > 0 ||
    bcc.trim().length > 0 ||
    subject.trim().length > 0 ||
    body.trim().length > 0;

  const currentDraft = (): Draft => ({
    id: draftId ?? `draft-${Date.now()}`,
    to: [...toItems, toText.trim()].filter(Boolean).join(', '),
    cc: cc || undefined,
    bcc: bcc || undefined,
    subject,
    body,
    savedAt: Date.now(),
  });

  const commitChip = () => {
    const parts = splitRecipients(toText);
    if (parts.length > 0) setToItems((prev) => [...prev, ...parts]);
    setToText('');
  };

  const onToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (toText.trim()) {
        e.preventDefault();
        commitChip();
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
    } else if (e.key === 'Backspace' && !toText && toItems.length > 0) {
      setToItems((prev) => prev.slice(0, -1));
    }
  };

  const send = () => onSend(currentDraft());

  /** Back from a dirty draft saves it; empty drafts just close. */
  const close = () => {
    if (dirty) onSaveDraft(currentDraft());
    onClose();
  };

  return (
    <div className="screen compose">
      <header className="compose-topbar">
        <button type="button" className="icon-btn ripplable" aria-label="Close compose" onClick={close}>
          <MaterialIcon name="arrow_back" />
        </button>
        <div className="compose-topbar__spacer" />
        <button
          type="button"
          className="icon-btn ripplable"
          aria-label="Attach file"
          onClick={() => onStatic?.('Attach — demo only')}
        >
          <MaterialIcon name="attach_file" />
        </button>
        <button type="button" className="icon-btn ripplable" aria-label="Send" onClick={send}>
          <MaterialIcon name="send" filled className="icon-ink" />
        </button>
        <button
          type="button"
          className="icon-btn ripplable"
          aria-label="More compose options"
          onClick={() => onStatic?.('More options — demo only')}
        >
          <MaterialIcon name="more_vert" />
        </button>
      </header>

      <div className="compose-fields no-scrollbar">
        <div className="compose-row">
          <span className="compose-label" id="from-label">
            From
          </span>
          <span className="compose-from">
            {ACCOUNT.email}
            <MaterialIcon name="expand_more" size={18} />
          </span>
        </div>

        <div className={`compose-row${toItems.length > 0 ? ' compose-row--chips' : ''}`}>
          <span className="compose-label" id="to-label">
            To
          </span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {toItems.map((item, i) => (
              <span key={`${item}-${i}`} className="compose-chip">
                <ProfileAvatar name={item} size={26} />
                <span className="compose-chip__name">{item}</span>
                <button
                  type="button"
                  className="compose-chip__x"
                  aria-label={`Remove ${item}`}
                  onClick={() => setToItems((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <MaterialIcon name="close" size={15} />
                </button>
              </span>
            ))}
            <input
              className="compose-input"
              style={{ minWidth: 80, flexBasis: 80, height: 34 }}
              aria-labelledby="to-label"
              autoFocus
              placeholder={toItems.length === 0 ? '' : 'Add recipient'}
              value={toText}
              onChange={(e) => setToText(e.target.value)}
              onKeyDown={onToKeyDown}
              onBlur={commitChip}
            />
          </div>
          {!showCc && !showBcc && toItems.length === 0 && (
            <button
              type="button"
              className="compose-ccbtn"
              aria-label="Show Cc and Bcc fields"
              onClick={() => setShowCc(true)}
            >
              Cc/Bcc
            </button>
          )}
        </div>

        {showCc && (
          <div className="compose-row">
            <span className="compose-label" id="cc-label">
              Cc
            </span>
            <input
              className="compose-input"
              aria-labelledby="cc-label"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
            />
            {!showBcc && (
              <button
                type="button"
                className="compose-ccbtn"
                aria-label="Show Bcc field"
                onClick={() => {
                  setShowCc(false);
                  setShowBcc(true);
                }}
              >
                Bcc
              </button>
            )}
          </div>
        )}

        {showBcc && (
          <div className="compose-row">
            <span className="compose-label" id="bcc-label">
              Bcc
            </span>
            <input
              className="compose-input"
              aria-labelledby="bcc-label"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
            />
            {!showCc && (
              <button
                type="button"
                className="compose-ccbtn"
                aria-label="Show Cc field"
                onClick={() => {
                  setShowBcc(false);
                  setShowCc(true);
                }}
              >
                Cc
              </button>
            )}
          </div>
        )}

        <div className="compose-row">
          <input
            className="compose-input"
            aria-label="Subject"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <textarea
          className="compose-body"
          aria-label="Compose email"
          placeholder="Compose email"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div className="compose-bottom">
        {BOTTOM_ACTIONS.map((a) => (
          <button
            key={a.label}
            type="button"
            className="icon-btn ripplable"
            aria-label={a.label}
            onClick={() => onStatic?.(`${a.label} — demo only`)}
          >
            <MaterialIcon name={a.icon} size={22} />
          </button>
        ))}
      </div>
    </div>
  );
}
