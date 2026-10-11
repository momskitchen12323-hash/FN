import { MaterialIcon } from './MaterialIcon';
import { CategoryTabs } from './CategoryTabs';
import type { Category, Folder } from '../types/email';

interface InboxHeaderProps {
  title: string;
  folder: Folder;
  category: Category;
  onCategory: (c: Category) => void;
  unreadByCategory?: Record<Category, number>;
}

/** Folder heading row ("Inbox"/"Sent") with the tune/filter icon and category tabs. */
export function InboxHeader({ title, folder, category, onCategory, unreadByCategory }: InboxHeaderProps) {
  return (
    <div className="inbox-header">
      <div className="folder-title-row">
        <h1 className="folder-title">{title}</h1>
        {folder === 'inbox' && (
          <button type="button" className="icon-btn" aria-label="Filter and settings">
            <MaterialIcon name="tune" className="icon-secondary" />
          </button>
        )}
      </div>
      {folder === 'inbox' && (
        <CategoryTabs active={category} onChange={onCategory} unreadByCategory={unreadByCategory} />
      )}
    </div>
  );
}
