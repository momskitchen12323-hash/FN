import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Category, Email, Folder } from '../types/email';
import { AppBar } from './AppBar';
import { EmailList } from './EmailList';
import { BottomNav } from './BottomNav';
import { ComposeFAB } from './ComposeFAB';
import { MaterialIcon } from './MaterialIcon';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface ListScreenProps {
  folder: Folder;
  emails: Email[];
  onOpenEmail: (id: string) => void;
  onToggleStar: (id: string) => void;
  onOpenDrawer: () => void;
  onCompose: () => void;
}

const CATEGORY_META: Record<
  Exclude<Category, 'none'>,
  { label: string; icon: string; className: string }
> = {
  primary: { label: 'Inbox', icon: 'inbox', className: 'bundle--primary' },
  promotions: { label: 'Promotions', icon: 'sell', className: 'bundle--promotions' },
  social: { label: 'Social', icon: 'group', className: 'bundle--social' },
  updates: { label: 'Updates', icon: 'info', className: 'bundle--updates' },
};

/**
 * Gmail 2026 inbox: hamburger + search pill header, a small folder label and a
 * single large white card. In the main Inbox the promo/social categories appear
 * as inline bundle rows with "N new" badges; the drawer switches categories.
 */
export function ListScreen({ folder, emails, onOpenEmail, onToggleStar, onOpenDrawer, onCompose }: ListScreenProps) {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const category: Exclude<Category, 'none'> =
    folder === 'sent' || (raw !== 'promotions' && raw !== 'social' && raw !== 'updates')
      ? 'primary'
      : raw;

  const label = folder === 'sent' ? 'Sent' : CATEGORY_META[category].label;
  useDocumentTitle(label);

  const visible = useMemo(() => {
    return emails.filter((e) => {
      if (e.folder !== folder) return false;
      if (folder === 'sent') return true;
      if (category !== 'primary') return e.category === category;
      return e.category === 'primary';
    });
  }, [emails, folder, category]);

  const inboxUnread = useMemo(
    () => emails.filter((e) => e.folder === 'inbox' && e.unread).length,
    [emails],
  );

  const bundles = useMemo(() => {
    if (folder !== 'inbox' || category !== 'primary') return [];
    return (['promotions', 'social', 'updates'] as const)
      .map((key) => {
        const items = emails.filter((e) => e.folder === 'inbox' && e.category === key);
        const unread = items.filter((e) => e.unread).length;
        return { key, items, unread };
      })
      .filter((b) => b.items.length > 0);
  }, [emails, folder, category]);

  return (
    <div className="list-screen">
      <AppBar onMenu={onOpenDrawer} />
      <main className="list-scroll no-scrollbar">
        <span className="list-label">{label}</span>
        <div className="mail-card">
          {bundles.map((b) => {
            const meta = CATEGORY_META[b.key];
            const senders = Array.from(new Set(b.items.map((i) => i.fromName).filter(Boolean)));
            return (
              <button
                key={b.key}
                type="button"
                className={`bundle-row ${meta.className}`}
                onClick={() => setParams({ tab: b.key })}
              >
                <span className="bundle-row__icon">
                  <MaterialIcon name={meta.icon} size={24} />
                </span>
                <span className="bundle-row__body">
                  <span className="bundle-row__name">{meta.label}</span>
                  <span className="bundle-row__snippet">{senders.join(', ')}</span>
                </span>
                {b.unread > 0 && <span className="bundle-badge">{b.unread} new</span>}
              </button>
            );
          })}
          <EmailList folder={folder} emails={visible} onOpen={onOpenEmail} onToggleStar={onToggleStar} />
        </div>
        <div className="list-bottom-pad" aria-hidden="true" />
      </main>
      <ComposeFAB onClick={onCompose} />
      <BottomNav unreadCount={inboxUnread} />
    </div>
  );
}
