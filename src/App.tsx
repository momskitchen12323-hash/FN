import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Email, Folder } from './types/email';
import { INITIAL_EMAILS } from './data/emails';
import { ListScreen } from './components/ListScreen';
import { EmailDetail } from './components/EmailDetail';
import { ComposeScreen } from './components/ComposeScreen';
import { NavigationDrawer } from './components/NavigationDrawer';
import { useDocumentTitle } from './hooks/useDocumentTitle';

const LIST_PATHS = new Set(['/', '/sent']);

interface ScreenActions {
  emails: Email[];
  toggleStar: (id: string) => void;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  removeEmail: (id: string) => void;
  showToast: (message: string) => void;
}

/** Route for a single open message. Back returns to the folder it was opened from. */
function EmailDetailScreen({ emails, toggleStar, markRead, markUnread, removeEmail, showToast }: ScreenActions) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const email = emails.find((e) => e.id === id);

  useEffect(() => {
    if (email && email.unread) markRead(email.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email?.id]);

  const folder: Folder = email?.folder ?? 'inbox';
  const fallbackPath = folder === 'sent' ? '/sent' : '/';

  const canGoBack = location.key !== 'default' && window.history.length > 1;
  const goBack = () => {
    if (canGoBack) navigate(-1);
    else navigate(fallbackPath);
  };

  if (!email) return <Navigate to="/" replace />;

  return (
    <EmailDetail
      email={email}
      onBack={goBack}
      onToggleStar={toggleStar}
      onArchive={(target) => {
        removeEmail(target.id);
        showToast('Conversation archived');
        goBack();
      }}
      onDelete={(target) => {
        removeEmail(target.id);
        showToast('Conversation deleted');
        goBack();
      }}
      onMarkUnread={(target) => {
        markUnread(target.id);
        showToast('Marked as unread');
        goBack();
      }}
      onStatic={(label) => showToast(`${label} — demo only`)}
    />
  );
}

export default function App() {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const lastListPath = useRef('/');
  const location = useLocation();
  const navigate = useNavigate();

  const patch = (id: string, changes: Partial<Email>) =>
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));

  const toggleStar = (id: string) =>
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e)));
  const markRead = (id: string) => patch(id, { unread: false });
  const markUnread = (id: string) => patch(id, { unread: true });
  const removeEmail = (id: string) => setEmails((prev) => prev.filter((e) => e.id !== id));

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2800);
  };

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

  const canGoBack = location.key !== 'default' && window.history.length > 1;
  const closeToLastList = () => {
    if (canGoBack) navigate(-1);
    else navigate(lastListPath.current);
  };

  const unreadCount = emails.filter((e) => e.folder === 'inbox' && e.unread).length;

  const currentFolder: Folder = (() => {
    const match = /^\/email\/([^/]+)$/.exec(location.pathname);
    if (match) return emails.find((e) => e.id === match[1])?.folder ?? 'inbox';
    return location.pathname === '/sent' ? 'sent' : 'inbox';
  })();

  return (
    <div className="app-frame">
      <Routes>
        <Route
          path="/"
          element={
            <ListScreen
              folder="inbox"
              emails={emails}
              onOpenEmail={(id) => navigate(`/email/${id}`)}
              onToggleStar={toggleStar}
              onOpenDrawer={() => setDrawerOpen(true)}
              onCompose={() => navigate('/compose')}
            />
          }
        />
        <Route
          path="/sent"
          element={
            <ListScreen
              folder="sent"
              emails={emails}
              onOpenEmail={(id) => navigate(`/email/${id}`)}
              onToggleStar={toggleStar}
              onOpenDrawer={() => setDrawerOpen(true)}
              onCompose={() => navigate('/compose')}
            />
          }
        />
        <Route
          path="/email/:id"
          element={
            <EmailDetailScreen
              emails={emails}
              toggleStar={toggleStar}
              markRead={markRead}
              markUnread={markUnread}
              removeEmail={removeEmail}
              showToast={showToast}
            />
          }
        />
        <Route
          path="/compose"
          element={
            <ComposeScreen
              onClose={closeToLastList}
              onSend={() => {
                showToast('Demo only — nothing was sent');
                closeToLastList();
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toast && (
        <div className="snackbar" role="status">
          {toast}
        </div>
      )}

      <NavigationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentFolder={currentFolder}
        unreadCount={unreadCount}
        onNavigateFolder={(folder) => {
          setDrawerOpen(false);
          navigate(folder === 'sent' ? '/sent' : '/');
        }}
        onNavigateCategory={(category) => {
          setDrawerOpen(false);
          navigate(category === 'primary' ? '/' : `/?tab=${category}`);
        }}
        onStatic={(label) => {
          setDrawerOpen(false);
          showToast(`${label} is static in this demo`);
        }}
      />
    </div>
  );
}
