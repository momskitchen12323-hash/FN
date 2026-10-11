import type { Email, Folder } from '../types/email';
import { EmailRow } from './EmailRow';
import { MaterialIcon } from './MaterialIcon';

interface EmailListProps {
  folder: Folder;
  emails: Email[];
  onOpen: (id: string) => void;
  onToggleStar: (id: string) => void;
}

const EMPTY_ICON: Record<Folder, string> = { inbox: 'inbox', sent: 'send' };

export function EmailList({ folder, emails, onOpen, onToggleStar }: EmailListProps) {
  if (emails.length === 0) {
    return (
      <div className="list-empty" role="status">
        <MaterialIcon name={EMPTY_ICON[folder]} size={72} />
        <p>Nothing here yet</p>
      </div>
    );
  }

  return (
    <ul className="email-list">
      {emails.map((email) => (
        <li key={email.id}>
          <EmailRow
            email={email}
            displayName={folder === 'sent' ? email.toName : email.fromName}
            onOpen={() => onOpen(email.id)}
            onToggleStar={() => onToggleStar(email.id)}
          />
        </li>
      ))}
    </ul>
  );
}
