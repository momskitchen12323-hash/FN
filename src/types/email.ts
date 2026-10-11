export type Folder = 'inbox' | 'sent';

export type Category = 'primary' | 'social' | 'promotions';

export interface Account {
  name: string;
  email: string;
}

export interface Email {
  id: string;
  folder: Folder;
  category: Category;
  /** Sender display name (inbox mail). */
  fromName: string;
  fromEmail: string;
  /** Recipient display name (used for Sent rows). */
  toName: string;
  toEmail: string;
  subject: string;
  snippet: string;
  /** Full message body. Paragraphs separated by blank lines; simple "-" list lines are preserved. */
  body: string;
  /** Compact list date, e.g. "10:42 AM", "Yesterday", "Oct 8". */
  date: string;
  /** Fuller timestamp for the detail header, e.g. "Sun, 11 Oct at 10:42". */
  fullDate: string;
  unread: boolean;
  starred: boolean;
  /** Deterministic avatar background color. */
  avatarColor: string;
}
