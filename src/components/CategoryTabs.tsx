import { MaterialIcon } from './MaterialIcon';
import type { Category } from '../types/email';

const TABS: { key: Category; icon: string; label: string }[] = [
  { key: 'primary', icon: 'inbox', label: 'Primary' },
  { key: 'promotions', icon: 'sell', label: 'Promotions' },
  { key: 'social', icon: 'group', label: 'Social' },
  { key: 'updates', icon: 'info', label: 'Updates' },
];

interface CategoryTabsProps {
  active: Category;
  onChange: (c: Category) => void;
  unreadByCategory?: Record<Category, number>;
}

/** Primary / Social / Promotions chips, Gmail-style with unread count badges. */
export function CategoryTabs({ active, onChange, unreadByCategory }: CategoryTabsProps) {
  return (
    <div className="cat-tabs" role="tablist" aria-label="Inbox categories">
      {TABS.map((t) => {
        const isActive = t.key === active;
        const unread = unreadByCategory?.[t.key] ?? 0;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`cat-tab${isActive ? ' cat-tab--active' : ''}`}
            onClick={() => onChange(t.key)}
          >
            <MaterialIcon name={t.icon} size={20} filled={isActive} />
            <span>{t.label}</span>
            {unread > 0 && <span className="cat-badge">{unread}</span>}
          </button>
        );
      })}
    </div>
  );
}
