import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Email } from '../types/email';
import { AppBar } from './AppBar';
import { BottomNav } from './BottomNav';
import { EmailList } from './EmailList';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MaterialIcon } from './MaterialIcon';

interface SearchScreenProps {
  emails: Email[];
  inboxUnread: number;
}

const FILTERS: { key: string; label: string }[] = [
  { key: 'from', label: 'From' },
  { key: 'to', label: 'To' },
  { key: 'subject', label: 'Subject' },
  { key: 'attachment', label: 'Attachment' },
  { key: 'date', label: 'Date' },
];

const RECENTS_KEY = 'gm-search-recent';

function readRecents(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(RECENTS_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Gmail search: pill opens this screen with text input, filter chips and live results. */
export function SearchScreen({ emails, inboxUnread }: SearchScreenProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [recents, setRecents] = useState<string[]>(() => readRecents());
  useDocumentTitle('Search');

  // Commit the query to session recents whenever the user submits (Enter).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const element = document.activeElement as HTMLElement | null;
      if (element && /search-input/i.test(element.className)) {
        const trimmed = query.trim();
        if (trimmed) {
          setRecents((prev) => {
            const next = [trimmed, ...prev.filter((r) => r !== trimmed)].slice(0, 6);
            sessionStorage.setItem(RECENTS_KEY, JSON.stringify(next));
            return next;
          });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [query]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return emails.filter((e) => {
      if (filters.has('attachment') && !(e.attachments && e.attachments.length > 0)) return false;
      if (filters.has('from') && !(`${e.fromName} ${e.fromEmail || ''}`.toLowerCase().includes(q))) return false;
      if (filters.has('to') && !(`${e.toName} ${e.toEmail || ''}`.toLowerCase().includes(q))) return false;
      if (filters.has('subject') && !e.subject.toLowerCase().includes(q)) return false;
      const haystack = `${e.subject} ${e.fromName} ${e.toName} ${e.snippet} ${e.messages.map((m) => m.body || '').join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [emails, filters, query]);

  const toggleFilter = (key: string) =>
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div className="screen search-screen list-screen">
      <div className="search-bar">
        <button type="button" className="icon-btn ripplable" aria-label="Back" onClick={() => navigate('/')}>
          <MaterialIcon name="arrow_back" className="icon-ink" />
        </button>
        <div className="search-field">
          <input
            className="search-input"
            autoFocus
            placeholder="Search in mail"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search in mail"
          />
          {query ? (
            <button type="button" className="icon-btn icon-x ripplable" aria-label="Clear search" onClick={() => setQuery('')}>
              <MaterialIcon name="close" size={20} />
            </button>
          ) : (
            <MaterialIcon name="search" size={22} className="icon-secondary" />
          )}
        </div>
      </div>

      <div className="search-chips" role="group" aria-label="Search filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip ${filters.has(f.key) ? 'chip--on' : ''}`}
            aria-pressed={filters.has(f.key)}
            onClick={() => toggleFilter(f.key)}
          >
            {f.key !== 'attachment' && <MaterialIcon name="expand_more" size={16} />}
            {f.label}
          </button>
        ))}
      </div>

      <main className="list-scroll no-scrollbar">
        {!query.trim() ? (
          <div className="search-recents">
            {recents.length > 0 && <p className="search-recents__head">Recent searches</p>}
            {recents.map((r) => (
              <button key={r} type="button" className="search-recent ripplable" onClick={() => setQuery(r)}>
                <MaterialIcon name="history" size={20} />
                <span className="search-recent__text">{r}</span>
              </button>
            ))}
            {recents.length === 0 && (
              <div className="list-empty">
                <MaterialIcon name="search" size={56} filled />
                <p>Search your email — this demo keeps recent searches in this browser tab only.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <span className="list-label">Results</span>
            {results.length > 0 ? (
              <div className="search-card">
                <EmailList
                  view="inbox"
                  emails={results}
                  onOpen={(id) => navigate(`/email/${id}`)}
                  onToggleStar={() => undefined}
                  rowChip={(e) => (e.folder === 'sent' ? 'Sent' : 'Inbox')}
                />
              </div>
            ) : (
              <div className="list-empty" role="status">
                <MaterialIcon name="search_off" size={56} filled />
                <p>No results found for “{query.trim()}”</p>
              </div>
            )}
          </>
        )}
        <div className="list-bottom-pad" aria-hidden="true" />
      </main>

      <BottomNav active="mail" inboxUnread={inboxUnread} />
    </div>
  );
}
