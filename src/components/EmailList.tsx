import type { Email, View } from '../types/email';
import { EmailRow } from './EmailRow';
import { SwipeableRow } from './SwipeableRow';
import { MaterialIcon } from './MaterialIcon';
import type { ReactNode } from 'react';

interface EmailListProps {
  view: Exclude<View, 'drafts' | 'chat' | 'meet' | 'search'>;
  emails: Email[];
  onOpen: (id: string) => void;
  onToggleStar: (id: string) => void;
  /** Swipe actions (inbox only). */
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** Selection mode driver (inbox only). */
  selection?: {
    mode: boolean;
    selectedIds: string[];
    onToggle: (id: string) => void;
    onEnter: (id: string) => void;
  };
  /** Folder chip on rows (search results). */
  rowChip?: (email: Email) => string | undefined;
}

const EMPTY_STATE: Record<string, { icon: string; text: string }> = {
  inbox: { icon: 'inbox', text: 'Nothing in the inbox' },
  sent: { icon: 'send', text: 'You haven’t sent anything yet' },
  starred: { icon: 'star', text: 'No starred conversations' },
};

export function EmailList({
  view,
  emails,
  onOpen,
  onToggleStar,
  onArchive,
  onDelete,
  selection,
  rowChip,
}: EmailListProps) {
  const canSelect = !!selection && view === 'inbox';
  const canSwipe = view === 'inbox' && !!onArchive;

  if (emails.length === 0) {
    const empty = EMPTY_STATE[view] ?? EMPTY_STATE.inbox;
    return (
      <div className="list-empty" role="status">
        <MaterialIcon name={empty.icon} size={64} filled />
        <p>{empty.text}</p>
      </div>
    );
  }

  const rows: ReactNode[] = emails.map((email, i) => {
    const displayName = view === 'sent' ? `To: ${email.toName || 'Me'}` : email.fromName;
    const row = (
      <EmailRow
        email={email}
        displayName={displayName}
        chipLabel={rowChip?.(email)}
        onOpen={() => (canSelect && selection?.mode ? selection.onToggle(email.id) : onOpen(email.id))}
        onToggleStar={() => onToggleStar(email.id)}
        selection={
          canSelect
            ? {
                mode: selection!.mode,
                selected: selection!.selectedIds.includes(email.id),
                onToggle: () => selection!.onToggle(email.id),
              }
            : undefined
        }
      />
    );
    return (
      <li key={email.id} style={{ animationDelay: `${Math.min(i, 8) * 18}ms` }}>
        <SwipeableRow
          emailId={email.id}
          disabled={!canSwipe || !!selection?.mode}
          onArchive={canSwipe && onArchive ? () => onArchive(email.id) : undefined}
          onDelete={canSwipe && onDelete ? () => onDelete(email.id) : undefined}
          onLongPress={
            canSelect && selection && !selection.mode ? () => selection.onEnter(email.id) : undefined
          }
        >
          {row}
        </SwipeableRow>
      </li>
    );
  });

  return <ul className="email-list">{rows}</ul>;
}
