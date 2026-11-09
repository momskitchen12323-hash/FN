import { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { ACCOUNT } from '../data/emails';

interface ComposeScreenProps {
  onClose: () => void;
  /** Demo "send": shows a discreet notification and closes; no real email leaves the app. */
  onSend: (draft: { to: string; subject: string; body: string }) => void;
}

/**
 * Full-screen Gmail Android Compose view (M3 Expressive): no title, a tinted
 * top bar with back / attach / filled send / overflow, hairline-separated
 * field rows and the bare body editor. Fields are editable; Cc/Bcc rows can be
 * revealed. Nothing is transmitted anywhere.
 */
export function ComposeScreen({ onClose, onSend }: ComposeScreenProps) {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const send = () => onSend({ to, subject, body });

  return (
    <div className="compose">
      <header className="compose-topbar">
        <button type="button" className="icon-btn" aria-label="Close compose" onClick={onClose}>
          <MaterialIcon name="arrow_back" />
        </button>
        <div className="compose-topbar__spacer" />
        <button type="button" className="icon-btn" aria-label="Attach file">
          <MaterialIcon name="attach_file" />
        </button>
        <button type="button" className="icon-btn" aria-label="Send" onClick={send}>
          <MaterialIcon name="send" filled className="icon-ink" />
        </button>
        <button type="button" className="icon-btn" aria-label="More compose options">
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

        <div className="compose-row">
          <span className="compose-label" id="to-label">
            To
          </span>
          <input
            className="compose-input"
            aria-labelledby="to-label"
            autoFocus
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          {!showCc && !showBcc && (
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
    </div>
  );
}
