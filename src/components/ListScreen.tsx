import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { Email, Folder } from '../types/email';
import { AppBar } from './AppBar';
import { ComposeFAB } from './ComposeFAB';
import { EmailList } from './EmailList';
import { CategoryTabs } from './CategoryTabs';
import { BottomNav } from './BottomNav';
import { useScrollHide, useRestoredScroll } from '../hooks/lists';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { parseStamp } from '../utils/format';
import { MaterialIcon } from './MaterialIcon';

interface ListScreenProps {
  folder: Folder;
  /** Starred drawer view (a filter over mail, not a Gmail "folder" here). */
  starred?: boolean;
  emails: Email[];
  inboxUnread: number;
  onOpenEmail: (id: string) => void;
  onToggleStar: (id: string) => void;
  /** Swipe / selection actions (inbox only). */
  onArchive: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onMarkUnread: (ids: string[]) => void;
  onOpenDrawer: () => void;
}

const CATEGORIES = [
  { key: 'primary', label: 'Primary' },
  { key: 'promotions', label: 'Promotions' },
  { key: 'social', label: 'Social' },
  { key: 'updates', label: 'Updates' },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]['key'];

/**
 * Gmail M3 Expressive inbox: hamburger + search pill header, category tab
 * strip, and each email in its own rounded container. Supports swipe,
 * long-press selection and pull-to-refresh on the mail lists.
 */
export function ListScreen({
  folder,
  starred,
  emails,
  inboxUnread,
  onOpenEmail,
  onToggleStar,
  onArchive,
  onDelete,
  onMarkUnread,
  onOpenDrawer,
}: ListScreenProps) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const scrollRef = useRef<HTMLElement>(null);

  const view = starred ? 'starred' : folder;
  const raw = params.get('tab');
  const category: CategoryKey =
    raw === 'promotions' || raw === 'social' || raw === 'updates' ? raw : 'primary';

  const label = starred ? 'Starred' : folder === 'sent' ? 'Sent' : '';
  useDocumentTitle(label || 'Inbox');

  const showTabs = view === 'inbox' && !starred;

  const visible = emails
    .filter((e) => {
      if (starred) return e.folder === 'inbox' && e.starred;
      if (e.folder !== folder) return false;
      if (folder === 'sent') return true;
      return category === 'primary' ? e.category === 'primary' : e.category === category;
    })
    .sort((a, b) => {
      const da = parseStamp(a.fullDate)?.getTime() ?? 0;
      const db = parseStamp(b.fullDate)?.getTime() ?? 0;
      return db - da; // newest first, like Gmail (stable for unparseable stamps)
    });

  // Switching tabs cancels a pending refresh indicator.
  useEffect(() => setRefreshing(false), [category, starred, folder]);

  // ---- Selection mode ----
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };
  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const runBulk = (op: (ids: string[]) => void) => {
    op(selectedIds);
    exitSelection();
  };

  // ---- Pull to refresh ----
  const [refreshing, setRefreshing] = useState(false);
  const pullGesture = useRef<{ startY: number; pulled: number } | null>(null);
  const pullStart = (e: React.PointerEvent) => {
    if ((scrollRef.current?.scrollTop ?? 0) <= 1) {
      pullGesture.current = { startY: e.clientY, pulled: 0 };
    }
  };
  const pullMove = (e: React.PointerEvent) => {
    const g = pullGesture.current;
    if (!g) return;
    g.pulled = e.clientY - g.startY;
  };
  const pullEnd = () => {
    const g = pullGesture.current;
    pullGesture.current = null;
    if (g && g.pulled > 90) {
      setRefreshing(true);
      window.setTimeout(() => setRefreshing(false), 1000);
    }
  };

  // ---- Scroll-driven chrome ----
  const navHidden = useScrollHide(scrollRef);
  useRestoredScroll(`${view}:${category}`, scrollRef);

  const count = selectedIds.length;

  return (
    <div className="screen list-screen">
      {selectionMode ? (
        <header className="selectbar" aria-label="Selection toolbar">
          <button type="button" className="icon-btn ripplable" aria-label="Clear selection" onClick={exitSelection}>
            <MaterialIcon name="close" className="icon-ink" />
          </button>
          <span className="selectbar__title" role="heading" aria-level={1}>
            {count} selected
          </span>
          <div className="detail-toolbar__spacer" />
          <button
            type="button"
            className="icon-btn ripplable"
            aria-label="Archive selected"
            onClick={() => runBulk(onArchive)}
          >
            <MaterialIcon name="archive" className="icon-ink" />
          </button>
          <button type="button" className="icon-btn ripplable" aria-label="Delete selected" onClick={() => runBulk(onDelete)}>
            <MaterialIcon name="delete" className="icon-ink" />
          </button>
          <button
            type="button"
            className="icon-btn ripplable"
            aria-label="Mark selected as unread"
            onClick={() => runBulk(onMarkUnread)}
          >
            <MaterialIcon name="mark_as_unread" className="icon-ink" />
          </button>
        </header>
      ) : (
        <AppBar onMenu={onOpenDrawer} onSearch={() => navigate('/search')} />
      )}

      {showTabs && !selectionMode && (
        <CategoryTabs
          categories={CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
          active={category}
          onChange={(key) => {
            const next = new URLSearchParams(params);
            next.set('tab', key);
            setParams(next, { replace: true });
          }}
        />
      )}

      {!showTabs && label && <span className="list-label">{label}</span>}

      <main
        className="list-scroll no-scrollbar"
        ref={scrollRef}
        onPointerDown={pullStart}
        onPointerMove={pullMove}
        onPointerUp={pullEnd}
        onPointerCancel={pullEnd}
      >
        <div className={`ptr${refreshing ? ' ptr--active' : ''}`} role="progressbar" aria-label="Refreshing">
          <span className="ptr__ring" />
        </div>

        <EmailList
          view={starred ? 'starred' : folder}
          emails={visible}
          onOpen={(id) => {
            if (!refreshing) onOpenEmail(id);
          }}
          onToggleStar={onToggleStar}
          onArchive={showTabs ? (id) => onArchive([id]) : undefined}
          onDelete={showTabs ? (id) => onDelete([id]) : undefined}
          selection={
            showTabs
              ? {
                  mode: selectionMode,
                  selectedIds,
                  onToggle: toggleSelect,
                  onEnter: (id) => {
                    setSelectionMode(true);
                    setSelectedIds([id]);
                  },
                }
              : undefined
          }
        />
        <div className="list-bottom-pad" aria-hidden="true" />
      </main>

      {showTabs && !selectionMode && (
        <ComposeFAB onClick={() => navigate('/compose')} hidden={navHidden} />
      )}
      <BottomNav
        active="mail"
        inboxUnread={inboxUnread}
        hidden={selectionMode ? false : navHidden}
      />
    </div>
  );
}
