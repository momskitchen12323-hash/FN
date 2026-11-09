interface CategoryTabsProps {
  categories: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}

/** M3 primary tab strip above the inbox list (Primary / Promotions / Social / Updates). */
export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="Inbox categories">
      {categories.map((c) => (
        <button
          key={c.key}
          type="button"
          role="tab"
          aria-selected={c.key === active}
          className={`tab${c.key === active ? ' tab--active' : ''}`}
          onClick={() => onChange(c.key)}
        >
          <span className="tab__label">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
