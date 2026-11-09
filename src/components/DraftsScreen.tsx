import type { Draft } from '../types/email';
import { AppBar } from './AppBar';
import { BottomNav } from './BottomNav';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MaterialIcon } from './MaterialIcon';
import { ComposeFAB } from './ComposeFAB';

interface DraftsScreenProps {
  drafts: Draft[];
  inboxUnread: number;
  onMenu: () => void;
}

/** Compose-draft list reachable from the drawer ("Drafts" in the real app). */
export function DraftsScreen({ drafts, inboxUnread, onMenu }: DraftsScreenProps) {
  const navigate = useNavigate();
  useDocumentTitle('Drafts');

  return (
    <div className="screen list-screen">
      <AppBar onMenu={onMenu} />
      <main className="list-scroll no-scrollbar">
        <span className="list-label">Drafts</span>
        {drafts.length > 0 ? (
          <div className="search-card">
            {drafts.map((d) => (
              <button key={d.id} type="button" className="draft-row ripplable" onClick={() => navigate(`/compose/${d.id}`)}>
                <div className="draft-row__body">
                  <span className="draft-row__label">Draft</span>
                  <span className="draft-row__subject">{d.subject || '(No subject)'}</span>
                  <span className="draft-row__snippet">{d.body || d.to || 'Compose email'}</span>
                </div>
                <span className="draft-row__date">
                  {new Date(d.savedAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="list-empty" role="status">
            <MaterialIcon name="draft" size={64} filled />
            <p>No drafts yet</p>
          </div>
        )}
        <div className="list-bottom-pad" aria-hidden="true" />
      </main>
      <ComposeFAB onClick={() => navigate('/compose')} />
      <BottomNav active="mail" inboxUnread={inboxUnread} />
    </div>
  );
}
