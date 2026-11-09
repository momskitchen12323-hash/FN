import { MaterialIcon } from './MaterialIcon';
import { ProfileAvatar } from './ProfileAvatar';
import { ACCOUNT, ACCOUNT_COLOR } from '../data/emails';
import type { Category, Folder } from '../types/email';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
  currentFolder: Folder;
  currentCategory: Exclude<Category, 'none'> | null;
  unreadCount: number;
  onNavigateFolder: (folder: Folder) => void;
  onNavigateCategory: (c: Category) => void;
  onStatic: (label: string) => void;
}

/** Inbox drawer categories, in the real app's order. */
const CATEGORIES: { key: Exclude<Category, 'none'>; icon: string; label: string }[] = [
  { key: 'primary', icon: 'inbox', label: 'Primary' },
  { key: 'promotions', icon: 'sell', label: 'Promotions' },
  { key: 'social', icon: 'group', label: 'Social' },
  { key: 'updates', icon: 'info', label: 'Updates' },
];

interface DrawerFolder {
  key: Folder | 'starred' | 'snoozed' | 'drafts' | 'spam' | 'trash';
  icon: string;
  label: string;
  navigable: boolean;
}

const FOLDERS: DrawerFolder[] = [
  { key: 'starred', icon: 'star', label: 'Starred', navigable: false },
  { key: 'snoozed', icon: 'schedule', label: 'Snoozed', navigable: false },
  { key: 'sent', icon: 'send', label: 'Sent', navigable: true },
  { key: 'drafts', icon: 'draft', label: 'Drafts', navigable: false },
];

const MISC: { icon: string; label: string }[] = [
  { icon: 'report', label: 'Spam' },
  { icon: 'delete', label: 'Trash' },
  { icon: 'settings', label: 'Settings' },
  { icon: 'help', label: 'Help & feedback' },
];

/**
 * Gmail Android slide-in navigation drawer with scrim, rounded right edge and
 * the pale-blue selected-item pill. Primary shows the live unread count.
 */
export function NavigationDrawer({
  open,
  onClose,
  currentFolder,
  currentCategory,
  unreadCount,
  onNavigateFolder,
  onNavigateCategory,
  onStatic,
}: NavigationDrawerProps) {
  const browsingInbox = currentFolder !== 'sent';

  return (
    <div className={`drawer${open ? ' drawer--open' : ''}`} aria-hidden={!open}>
      <div className="drawer__scrim" onClick={onClose} />
      <nav className="drawer__panel" aria-label="Gmail navigation" role="dialog" aria-modal={open || undefined}>
        <div className="drawer__header">
          <ProfileAvatar name={ACCOUNT.name} color={ACCOUNT_COLOR} size={44} />
          <div className="drawer__account">
            <span className="drawer__name">{ACCOUNT.name}</span>
            <span className="drawer__email">{ACCOUNT.email}</span>
          </div>
        </div>

        <div className="drawer__group">
          {CATEGORIES.map((c) => {
            const isActive = browsingInbox && currentCategory === c.key;
            return (
              <button
                key={c.key}
                type="button"
                className={`drawer-item${isActive ? ' drawer-item--active' : ''}`}
                onClick={() => onNavigateCategory(c.key)}
              >
                <MaterialIcon name={c.icon} filled={isActive} />
                <span className="drawer-item__label">{c.label}</span>
                {c.key === 'primary' && unreadCount > 0 && (
                  <span className="drawer-item__badge">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="drawer__divider" role="presentation" />

        <div className="drawer__group">
          {FOLDERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`drawer-item${f.key === 'sent' && !browsingInbox ? ' drawer-item--active' : ''}`}
              onClick={() => (f.navigable ? onNavigateFolder(f.key as Folder) : onStatic(f.label))}
            >
              <MaterialIcon name={f.icon} />
              <span className="drawer-item__label">{f.label}</span>
            </button>
          ))}
        </div>

        <div className="drawer__divider" role="presentation" />

        <div className="drawer__group">
          {MISC.map((m) => (
            <button key={m.label} type="button" className="drawer-item" onClick={() => onStatic(m.label)}>
              <MaterialIcon name={m.icon} />
              <span className="drawer-item__label">{m.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
