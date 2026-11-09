import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Draft, Email, View } from './types/email';
import { INITIAL_EMAILS } from './data/emails';
import { ListScreen } from './components/ListScreen';
import { EmailDetail } from './components/EmailDetail';
import { ComposeScreen } from './components/ComposeScreen';
import { NavigationDrawer } from './components/NavigationDrawer';
import { ChatScreen } from './components/ChatScreen';
import { MeetScreen } from './components/MeetScreen';
import { SearchScreen } from './components/SearchScreen';
import { DraftsScreen } from './components/DraftsScreen';
import { GmailMark } from './components/GmailMark';
import { installRipples } from './utils/ripple';
import { installTheme } from './utils/theme';

const LIST_PATHS = new Set(['/', '/sent', '/starred', '/drafts', '/chat', '/meet']);

interface ScreenActions {
  emails: Email[];
  inboxUnread: number;
  toggleStar: (id: string) => void;
  markRead: (id: string) => void;
  showToast: (message: string, action?: { label: string; run: () => void }) => void;
  archiveEmails: (ids: string[]) => void;
  deleteEmails: (ids: string[]) => void;
  markUnread: (ids: string[]) => void;
}

/** Route for a single open message. Back returns to the folder it was opened from. */
function EmailDetailScreen({
  emails,
  inboxUnread,
  toggleStar,
  markRead,
  showToast,
  archiveEmails,
  deleteEmails,
  markUnread,
}: ScreenActions) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const email = emails.find((e) => e.id === id);

  useEffect(() => {
    if (email && email.unread) markRead(email.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email?.id]);

  const folder = email?.folder ?? 'inbox';
  const fallbackPath = folder === 'sent' ? '/sent' : '/';

  const canGoBack = location.key !== 'default' && window.history.length > 1;
  const goBack = () => {
    if (canGoBack) navigate(-1);
    else navigate(fallbackPath);
  };

  if (!email) return <Navigate to="/" replace />;

  return (
    <EmailDetail
      key={email.id}
      email={email}
      inboxUnread={inboxUnread}
      onBack={goBack}
      onToggleStar={toggleStar}
      onArchive={(target) => {
        archiveEmails([target.id]);
        goBack();
      }}
      onDelete={(target) => {
        deleteEmails([target.id]);
        goBack();
      }}
      onMarkUnread={(target) => {
        markUnread([target.id]);
        goBack();
      }}
      onStatic={(label) => showToast(`${label} — demo only`)}
    />
  );
}

export default function App() {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('gm-drafts') || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    sessionStorage.setItem('gm-drafts', JSON.stringify(drafts));
  }, [drafts]);
  const [toast, setToast] = useState<{
    message: string;
    action?: { label: string; run: () => void };
  } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const lastListPath = useRef('/');
  const undoSnapshot = useRef<Email[] | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => installRipples(), []);
  useEffect(() => installTheme(), []);

  const patch = (id: string, changes: Partial<Email>) =>
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));

  const toggleStar = (id: string) =>
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  const markRead = (id: string) => patch(id, { unread: false });

  const archiveEmails = (ids: string[]) => {
    setEmails((prev) => {
      undoSnapshot.current = prev;
      return prev.filter((e) => !ids.includes(e.id));
    });
    const many = ids.length > 1;
    showToast(
      many ? `${ids.length} conversations archived` : 'Conversation archived',
      {
        label: 'Undo',
        run: () => {
          if (undoSnapshot.current) setEmails(undoSnapshot.current);
          undoSnapshot.current = null;
          setToast(null);
        },
      },
    );
  };

  const deleteEmails = (ids: string[]) => {
    setEmails((prev) => {
      undoSnapshot.current = prev;
      return prev.filter((e) => !ids.includes(e.id));
    });
    const many = ids.length > 1;
    showToast(
      many ? `${ids.length} conversations deleted` : 'Conversation deleted',
      {
        label: 'Undo',
        run: () => {
          if (undoSnapshot.current) setEmails(undoSnapshot.current);
          undoSnapshot.current = null;
          setToast(null);
        },
      },
    );
  };

  const markUnread = (ids: string[]) => {
    setEmails((prev) => prev.map((e) => (ids.includes(e.id) ? { ...e, unread: true } : e)));
    showToast(ids.length > 1 ? `${ids.length} marked as unread` : 'Marked as unread');
  };

  const showToast = (message: string, action?: { label: string; run: () => void }) => {
    setToast({ message, action });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  };

  const upsertDraft = (draft: Draft) =>
    setDrafts((prev) =>
      prev.some((d) => d.id === draft.id) ? prev.map((d) => (d.id === draft.id ? draft : d)) : [draft, ...prev],
    );
  const removeDraft = (id: string) => setDrafts((prev) => prev.filter((d) => d.id !== id));

  // Remember the last list route so Compose always closes back to a real folder.
  useEffect(() => {
    if (LIST_PATHS.has(location.pathname)) lastListPath.current = location.pathname;
  }, [location.pathname]);

  // Escape closes the drawer, like the real app.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const inboxUnread = emails.filter((e) => e.folder === 'inbox' && e.unread).length;

  const currentView: View = (() => {
    const match = /^\/email\/([^/]+)$/.exec(location.pathname);
    if (match) {
      const email = emails.find((e) => e.id === match[1]);
      return email?.folder === 'sent' ? 'sent' : 'inbox';
    }
    if (location.pathname === '/sent') return 'sent';
    if (location.pathname === '/starred') return 'starred';
    if (location.pathname === '/drafts') return 'drafts';
    if (location.pathname === '/chat') return 'chat';
    if (location.pathname === '/meet') return 'meet';
    if (location.pathname === '/search') return 'search';
    return 'inbox';
  })();

  const canGoBack = location.key !== 'default' && window.history.length > 1;
  const closeToLastList = () => {
    if (canGoBack) navigate(-1);
    else navigate(lastListPath.current);
  };

  const screenActions: ScreenActions = {
    emails,
    inboxUnread,
    toggleStar,
    markRead,
    showToast,
    archiveEmails,
    deleteEmails,
    markUnread,
  };

  return (
    <div className="app-frame">
      <Routes>
        <Route
          path="/"
          element={
            <ListScreen
              folder="inbox"
              emails={emails}
              inboxUnread={inboxUnread}
              onOpenEmail={(id) => navigate(`/email/${id}`)}
              onToggleStar={toggleStar}
              onArchive={archiveEmails}
              onDelete={deleteEmails}
              onMarkUnread={markUnread}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
          }
        />
        <Route
          path="/sent"
          element={
            <ListScreen
              folder="sent"
              emails={emails}
              inboxUnread={inboxUnread}
              onOpenEmail={(id) => navigate(`/email/${id}`)}
              onToggleStar={toggleStar}
              onArchive={archiveEmails}
              onDelete={deleteEmails}
              onMarkUnread={markUnread}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
          }
        />
        <Route
          path="/starred"
          element={
            <ListScreen
              folder="inbox"
              starred
              emails={emails}
              inboxUnread={inboxUnread}
              onOpenEmail={(id) => navigate(`/email/${id}`)}
              onToggleStar={toggleStar}
              onArchive={archiveEmails}
              onDelete={deleteEmails}
              onMarkUnread={markUnread}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
          }
        />
        <Route path="/email/:id" element={<EmailDetailScreen {...screenActions} />} />
        <Route
          path="/compose"
          element={
            <ComposeRoute
              drafts={drafts}
              onClose={closeToLastList}
              onStatic={showToast}
              onSaveDraft={(draft) => {
                upsertDraft(draft);
                showToast('Message saved as draft.');
              }}
              onSend={(draft) => {
                if (drafts.some((d) => d.id === draft.id)) removeDraft(draft.id);
                showToast('Message sent.');
                closeToLastList();
              }}
            />
          }
        />
        <Route
          path="/compose/:draftId"
          element={
            <ComposeRoute
              drafts={drafts}
              onClose={closeToLastList}
              onStatic={showToast}
              onSaveDraft={(draft) => {
                upsertDraft(draft);
                showToast('Message saved as draft.');
              }}
              onSend={(draft) => {
                if (drafts.some((d) => d.id === draft.id)) removeDraft(draft.id);
                showToast('Message sent.');
                closeToLastList();
              }}
            />
          }
        />
        <Route
          path="/drafts"
          element={<DraftsScreen drafts={drafts} inboxUnread={inboxUnread} onMenu={() => setDrawerOpen(true)} />}
        />
        <Route path="/search" element={<SearchScreen emails={emails} inboxUnread={inboxUnread} />} />
        <Route path="/chat" element={<ChatScreen inboxUnread={inboxUnread} onOpenDrawer={() => setDrawerOpen(true)} />} />
        <Route path="/meet" element={<MeetScreen inboxUnread={inboxUnread} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toast && (
        <div className="snackbar" role="status">
          <span className="snackbar__logo">
            <GmailMark size={18} />
          </span>
          <span className="snackbar__text">{toast.message}</span>
          {toast.action && (
            <button type="button" className="snackbar__action" onClick={toast.action.run}>
              {toast.action.label}
            </button>
          )}
        </div>
      )}

      <NavigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentView={currentView}
        unreadCount={inboxUnread}
        onNavigateFolder={(folder) => {
          setDrawerOpen(false);
          navigate(
            folder === 'sent' ? '/sent' : folder === 'starred' ? '/starred' : folder === 'drafts' ? '/drafts' : '/',
          );
        }}
        onStatic={(label) => {
          setDrawerOpen(false);
          showToast(`${label} is static in this demo`);
        }}
      />
    </div>
  );
}

/** Compose host that resolves an optional :draftId from local drafts. */
function ComposeRoute({
  drafts,
  onClose,
  onSend,
  onSaveDraft,
  onStatic,
}: {
  drafts: Draft[];
  onClose: () => void;
  onSend: (draft: Draft) => void;
  onSaveDraft: (draft: Draft) => void;
  onStatic: (label: string) => void;
}) {
  const { draftId } = useParams<{ draftId?: string }>();
  const initial = draftId ? drafts.find((d) => d.id === draftId) ?? null : null;
  return (
    <ComposeScreen
      key={draftId ?? 'new'}
      initial={initial}
      onClose={onClose}
      onSend={onSend}
      onSaveDraft={onSaveDraft}
      onStatic={onStatic}
    />
  );
}
