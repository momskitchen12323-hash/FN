import { useRef } from 'react';
import { BottomNav } from './BottomNav';
import { ProfileAvatar } from './ProfileAvatar';
import { useScrollHide } from '../hooks/lists';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MaterialIcon } from './MaterialIcon';

interface MeetScreenProps {
  inboxUnread: number;
}

/** Google Meet tab inside Gmail: New meeting / Join with a code, like the real tab. */
export function MeetScreen({ inboxUnread }: MeetScreenProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const navHidden = useScrollHide(scrollRef);
  useDocumentTitle('Meet');

  return (
    <div className="screen list-screen">
      <header className="appbar">
        <button type="button" className="icon-btn appbar__menu ripplable" aria-label="Main menu">
          <MaterialIcon name="menu" className="icon-secondary" />
        </button>
        <div className="detail-toolbar__spacer" />
        <button type="button" className="appbar__avatar-btn ripplable" aria-label="Google Account: Sihle Mkhize">
          <ProfileAvatar name="Sihle Mkhize" color="#DB4437" size={34} />
        </button>
      </header>
      <main className="list-scroll no-scrollbar" ref={scrollRef}>
        <span className="list-label">Meet</span>
        <div className="misc-card">
          <div className="meet-actions">
            <button type="button" className="meet-btn ripplable">
              <MaterialIcon name="videocam" size={20} filled />
              New meeting
            </button>
            <button type="button" className="meet-btn meet-btn--tonal ripplable">
              <MaterialIcon name="keyboard" size={20} />
              Join with a code
            </button>
          </div>
          <p style={{ margin: 0 }}>
            Meetings run in the Google Meet app — this demo keeps the screen faithful but static.
          </p>
        </div>
        <div className="list-bottom-pad" aria-hidden="true" />
      </main>
      <BottomNav active="meet" inboxUnread={inboxUnread} hidden={navHidden} />
    </div>
  );
}
