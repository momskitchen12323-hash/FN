import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from './MaterialIcon';

export type NavTab = 'mail' | 'chat' | 'meet';

interface BottomNavProps {
  active: NavTab;
  inboxUnread: number;
  /** Static demo badge count for the Chat tab (matches the reference app). */
  chatUnread?: number;
  hidden?: boolean;
  onNavigate?: (tab: NavTab) => void;
}

const PATHS: Record<NavTab, string> = { mail: '/', chat: '/chat', meet: '/meet' };

/** Connected M3 Expressive bottom bar: Mail, Chat, Meet — icon-only with badges. */
export function BottomNav({ active, inboxUnread, chatUnread = 2, hidden, onNavigate }: BottomNavProps) {
  const navigate = useNavigate();
  const tabs: { key: NavTab; icon: string; label: string; badge?: number | string }[] = [
    { key: 'mail', icon: 'mail', label: 'Mail', badge: inboxUnread > 0 ? (inboxUnread > 99 ? '99+' : inboxUnread) : 0 },
    { key: 'chat', icon: 'chat', label: 'Chat', badge: chatUnread > 0 ? chatUnread : 0 },
    { key: 'meet', icon: 'videocam', label: 'Meet' },
  ];
  const go = (tab: NavTab) => {
    onNavigate?.(tab);
    navigate(PATHS[tab]);
  };
  return (
    <nav className={`bottom-nav${hidden ? ' bottom-nav--hidden' : ''}`} aria-label="Primary">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`nav-btn${tab.key === active ? ' nav-btn--active' : ''}`}
          aria-label={tab.label}
          aria-current={tab.key === active ? 'page' : undefined}
          onClick={() => go(tab.key)}
        >
          <span className="nav-indicator">
            <MaterialIcon name={tab.icon} size={24} filled={tab.key === active} />
            {tab.badge != null && tab.badge !== 0 && <span className="nav-badge">{tab.badge}</span>}
          </span>
        </button>
      ))}
    </nav>
  );
}
