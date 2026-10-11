import { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface ComposeScreenProps {
  onClose: () => void;
  /** Demo "send": shows a discreet notification and closes; no real email leaves the app. */
  onSend: (draft: { to: string; subject: string; body: string }) => void;
}

/**
 * Full-screen Gmail Android Compose view. Fields are editable, Cc/Bcc rows can
 * be revealed, and the bottom toolbar mirrors Gmail's attachment/formatting
 * affordances. Nothing is transmitted anywhere.
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
          <MaterialIcon name="close" className="icon-secondary" />
        </button>
        <h1 className="compose-title">Compose</h1>
        <div className="compose-topbar__spacer" />
        <button type="button" className="icon-btn" aria-label="Send" onClick={send}>
          <MaterialIcon name="send" className="icon-secondary" />
        </button>
      </header>

      <div className="compose-scroll no-scrollbar">
        <div className="compose-field-row">
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
              Cc Bcc
            </button>
          )}
        </div>

        {showCc && (
          <div className="compose-field-row">
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
          <div className="compose-field-row">
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

        <div className="compose-field-row">
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
        <button type="button" className="icon-btn" aria-label="Attach file">
          <MaterialIcon name="attach_file" size={22} className="icon-secondary" />
        </button>
        <button type="button" className="icon-btn" aria-label="Insert photo">
          <MaterialIcon name="image" size={22} className="icon-secondary" />
        </button>
        <button type="button" className="icon-btn" aria-label="Insert link">
          <MaterialIcon name="link" size={22} className="icon-secondary" />
        </button>
        <button type="button" className="icon-btn" aria-label="Formatting options">
          <MaterialIcon name="format_color_text" size={22} className="icon-secondary" />
        </button>
        <div className="compose-bottom__spacer" />
        <button type="button" className="icon-btn" aria-label="More compose options">
          <MaterialIcon name="more_vert" size={22} className="icon-secondary" />
        </button>
      </div>
    </div>
  );
}
