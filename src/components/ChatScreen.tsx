import { useRef } from 'react';
import { AppBar } from './AppBar';
import { BottomNav } from './BottomNav';
import { useScrollHide } from '../hooks/lists';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MaterialIcon } from './MaterialIcon';

interface ChatScreenProps {
  inboxUnread: number;
  onOpenDrawer: () => void;
}

/** Google Chat tab inside Gmail: contained empty state (no chat data in the snapshot). */
export function ChatScreen({ inboxUnread, onOpenDrawer }: ChatScreenProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const navHidden = useScrollHide(scrollRef);
  useDocumentTitle('Chat');

  return (
    <div className="screen list-screen">
      <AppBar onMenu={onOpenDrawer} pillLabel="Search in chat" spark={false} />
      <main className="list-scroll no-scrollbar" ref={scrollRef}>
        <span className="list-label">Chat</span>
        <div className="misc-card">
          <MaterialIcon name="chat" size={64} filled />
          <p>
            Chat conversations appear here in the real Gmail app. This demo snapshot contains mail
            only.
          </p>
        </div>
        <div className="list-bottom-pad" aria-hidden="true" />
      </main>
      <BottomNav active="chat" inboxUnread={inboxUnread} hidden={navHidden} />
    </div>
  );
}
