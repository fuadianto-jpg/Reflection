import type { CSSProperties } from "react";
import type { BookApp } from "../types";

export default function AppCard({ app }: { app: BookApp }) {
  const style = { "--accent": app.accent_color || "var(--amber)" } as CSSProperties;

  return (
    <a
      className="card"
      style={style}
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="card-cover">
        {app.cover_url ? (
          <img src={app.cover_url} alt={`Cover ${app.title}`} loading="lazy" />
        ) : (
          <div className="card-cover-fallback">📖</div>
        )}
      </div>
      <div className="card-body">
        <div className="card-title">{app.title}</div>
        <div className="card-book">
          <span className="card-inspired">Inspired by</span> {app.book_title}
          {app.author && app.author !== "—" ? ` — ${app.author}` : ""}
        </div>
      </div>
    </a>
  );
}
