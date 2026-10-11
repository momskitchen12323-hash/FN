import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Category, Email, Folder } from '../types/email';
import { AppBar } from './AppBar';
import { InboxHeader } from './InboxHeader';
import { EmailList } from './EmailList';
import { BottomNav } from './BottomNav';
import { ComposeFAB } from './ComposeFAB';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

interface ListScreenProps {
  folder: Folder;
  emails: Email[];
  onOpenEmail: (id: string) => void;
  onToggleStar: (id: string) => void;
  onOpenDrawer: () => void;
  onCompose: () => void;
}

/**
 * Shared shell for the Inbox and Sent screens: app bar, folder heading,
 * category tabs (Inbox only), scrolling email list, bottom Mail/Meet bar and
 * the floating Compose button.
 */
export function ListScreen({ folder, emails, onOpenEmail, onToggleStar, onOpenDrawer, onCompose }: ListScreenProps) {
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const category: Category = folder === 'sent' || (raw !== 'social' && raw !== 'promotions') ? 'primary' : raw;

  useDocumentTitle(folder === 'sent' ? 'Sent' : 'Inbox');

  const visible = useMemo(() => {
    return emails.filter((e) => {
      if (e.folder !== folder) return false;
      if (folder === 'inbox' && category !== 'primary') return e.category === category;
      return true;
    });
  }, [emails, folder, category]);

  const unreadByCategory = useMemo(() => {
    const counts: Record<Category, number> = { primary: 0, social: 0, promotions: 0 };
    for (const e of emails) {
      if (e.folder === 'inbox' && e.unread) counts[e.category] += 1;
    }
    return counts;
  }, [emails]);

  return (
    <div className="list-screen">
      <AppBar onMenu={onOpenDrawer} />
      <InboxHeader
        title={folder === 'sent' ? 'Sent' : 'Inbox'}
        folder={folder}
        category={category}
        onCategory={(c) => setParams(c === 'primary' ? {} : { tab: c })}
        unreadByCategory={folder === 'sent' ? undefined : unreadByCategory}
      />
      <main className="list-scroll no-scrollbar">
        <EmailList folder={folder} emails={visible} onOpen={onOpenEmail} onToggleStar={onToggleStar} />
      </main>
      <BottomNav />
      <ComposeFAB onClick={onCompose} />
    </div>
  );
}
