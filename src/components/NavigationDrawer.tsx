import { MaterialIcon } from './MaterialIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { ACCOUNT, ACCOUNT_COLOR } from '../data/emails';
import type { View } from '../types/email';

interface NavItem {
  key: string;
  icon: string;
  label: string;
  badge?: number;
  navigable?: boolean;
}

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Which view is currently on screen (drawer highlights it). */
  currentView: View;
  unreadCount: number;
  onNavigateFolder: (folder: 'inbox' | 'sent' | 'starred' | 'drafts') => void;
  onStatic: (label: string) => void;
}

/** Gmail Android drawer order (Postmark-free): mail views, then system folders, then settings. */
const PRIMARY: NavItem[] = [
  { key: 'inbox', icon: 'inbox', label: 'Inbox', navigable: true },
];

const FOLDERS: NavItem[] = [
  { key: 'starred', icon: 'star', label: 'Starred', navigable: true },
  { key: 'snoozed', icon: 'schedule', label: 'Snoozed' },
  { key: 'sent', icon: 'send', label: 'Sent', navigable: true },
  { key: 'drafts', icon: 'draft', label: 'Drafts', navigable: true },
];

const SYSTEM: NavItem[] = [
  { key: 'spam', icon: 'report', label: 'Spam' },
  { key: 'trash', icon: 'delete', label: 'Trash' },
];

const MISC: NavItem[] = [
  { icon: 'settings', key: 'settings', label: 'Settings' },
  { icon: 'help', key: 'help', label: 'Help & feedback' },
];

/**
 * Gmail Android slide-in navigation drawer with scrim, rounded right edge and
 * the pale-blue selected-item pill. Inbox shows the live unread count.
 */
export function NavigationDrawer({
  open,
  onClose,
  currentView,
  unreadCount,
  onNavigateFolder,
  onStatic,
}: NavigationDrawerProps) {
  const groups: { items: NavItem[]; activeKey: string | null }[] = [
    {
      items: PRIMARY.map((n) => (n.key === 'inbox' ? { ...n, badge: unreadCount } : n)),
      activeKey: currentView === 'inbox' ? 'inbox' : null,
    },
    {
      items: FOLDERS,
      activeKey:
        currentView === 'starred' || currentView === 'sent' || currentView === 'drafts'
          ? currentView
          : null,
    },
    { items: [...SYSTEM, ...MISC], activeKey: null },
  ];

  return (
    <div className={`drawer${open ? ' drawer--open' : ''}`} aria-hidden={!open}>
      <button type="button" className="drawer__scrim" aria-label="Close menu" onClick={onClose} />
      <nav className="drawer__panel" aria-label="Gmail navigation" role="dialog" aria-modal={open || undefined}>
        <div className="drawer__header">
          <ProfileAvatar name={ACCOUNT.name} color={ACCOUNT_COLOR} size={44} />
          <div className="drawer__account">
            <span className="drawer__name">{ACCOUNT.name}</span>
            <span className="drawer__email">{ACCOUNT.email}</span>
          </div>
        </div>

        {groups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="drawer__divider" role="presentation" />}
            <div className="drawer__group">
              {group.items.map((n) => (
                <button
                  key={n.key}
                  type="button"
                  className={`drawer-item${group.activeKey === n.key ? ' drawer-item--active' : ''}`}
                  onClick={() => (n.navigable ? onNavigateFolder(n.key as 'inbox' | 'sent' | 'starred' | 'drafts') : onStatic(n.label))}
                >
                  <MaterialIcon name={n.icon} filled={group.activeKey === n.key} />
                  <span className="drawer-item__label">{n.label}</span>
                  {n.badge != null && n.badge > 0 && <span className="drawer-item__badge">{n.badge}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
