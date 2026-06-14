import { useEffect } from "react";
import PhoneMockup from "./PhoneMockup";
import type { BookApp } from "../types";

export default function PreviewModal({
  app,
  onClose,
}: {
  app: BookApp;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="preview-backdrop" onClick={onClose}>
      <button className="preview-close" onClick={onClose} aria-label="Tutup">
        ✕
      </button>
      <div className="preview-box" onClick={(e) => e.stopPropagation()}>
        <PhoneMockup>
          <iframe
            className="preview-frame"
            src={app.url}
            title={`Preview ${app.title}`}
            loading="lazy"
          />
        </PhoneMockup>

        <div className="preview-meta">
          <h3>{app.title}</h3>
          <p className="preview-book">
            <span className="card-inspired">Inspired by</span> {app.book_title}
            {app.author && app.author !== "—" ? ` — ${app.author}` : ""}
          </p>
          <a
            className="btn btn-primary"
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buka penuh →
          </a>
          <p className="preview-hint">
            Preview langsung di dalam mockup. Jika layar kosong, app memblokir
            embed — klik “Buka penuh”.
          </p>
        </div>
      </div>
    </div>
  );
}
