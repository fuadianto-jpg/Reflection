export type AppStatus = "published" | "draft";

export interface BookApp {
  id: string;
  title: string;
  book_title: string;
  author: string;
  url: string;
  cover_url: string;
  accent_color: string;
  text_color: string;
  category: string;
  status: AppStatus;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export type AppInput = Omit<BookApp, "id" | "created_at" | "updated_at">;
