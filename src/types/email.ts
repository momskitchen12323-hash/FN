export type Folder = 'inbox' | 'sent';

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
