import type { BookApp } from "../types";
import { generateCoverSvg } from "../lib/cover";

/**
 * Demo data used when Supabase is not configured, so the gallery is
 * never empty during development. Covers are auto-generated.
 */
const seed = [
  {
    id: "demo-1",
    title: "Merdeka",
    book_title: "The Freedom Mindset",
    author: "—",
    url: "https://example.com/merdeka",
    accent_color: "#1a4b28",
    text_color: "#f8f3e6",
    category: "Produktivitas",
  },
  {
    id: "demo-2",
    title: "Atomic",
    book_title: "Atomic Habits",
    author: "James Clear",
    url: "https://example.com/atomic",
    accent_color: "#c8981e",
    text_color: "#1a2e15",
    category: "Kebiasaan",
  },
  {
    id: "demo-3",
    title: "Tenang",
    book_title: "Meditations",
    author: "Marcus Aurelius",
    url: "https://example.com/tenang",
    accent_color: "#9b6b35",
    text_color: "#f8f3e6",
    category: "Filosofi",
  },
];

export const DEMO_APPS: BookApp[] = seed.map((s, i) => ({
  ...s,
  status: "published",
  sort_order: i + 1,
  cover_url: generateCoverSvg({
    title: s.title,
    book: s.book_title,
    author: s.author,
    bg: s.accent_color,
    text: s.text_color,
  }),
}));
