export type Folder = 'inbox' | 'sent';

/** Views reachable from the drawer; 'starred' is a filter over mail. */
export type View = Folder | 'starred' | 'drafts' | 'chat' | 'meet' | 'search';

export type Category = 'primary' | 'promotions' | 'social' | 'updates' | 'none';

export interface Attachment {
  name: string;
  size?: string;
  type?: string;
}

/** One message inside a Gmail conversation thread. */
export interface ThreadMessage {
  fromName: string;
  fromEmail?: string;
  /** Recipient for the expanded "to …" line ("me" for received mail). */
  toName?: string;
  toEmail?: string;
  date?: string;
  body?: string;
  attachments?: Attachment[];
  avatarBg?: string;
}

export interface Account {
  name: string;
  email: string;
}

export interface Email {
  id: string;
  folder: Folder;
  category: Category;
  /** Row display name (sender for inbox, recipient for sent). */
  fromName: string;
  fromEmail?: string;
  toName: string;
  toEmail?: string;
  subject: string;
  snippet: string;
  /** True when the thread carries the CSV-style attachment chips in the row. */
  attachments?: Attachment[];
  /** Full conversation, in chronological order. `body` is a fallback for single-message mail. */
  messages: ThreadMessage[];
  /** Compact list date, e.g. "10:42 AM". */
  date?: string;
  /** Fuller timestamp for the detail header, e.g. "Sun, 11 Oct at 10:42". */
  fullDate?: string;
  unread: boolean;
  starred: boolean;
  avatarColor: string;
}

/** Locally stored compose draft. */
export interface Draft {
  id: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  savedAt: number;
}
