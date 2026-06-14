import { useEffect, useMemo, useState } from "react";
import { listApps } from "../lib/api";
import type { BookApp } from "../types";
import AppCard from "../components/AppCard";
import PhoneMockup from "../components/PhoneMockup";
import PreviewModal from "../components/PreviewModal";

export default function Gallery() {
  const [apps, setApps] = useState<BookApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Semua");
  const [preview, setPreview] = useState<BookApp | null>(null);

  useEffect(() => {
    listApps()
      .then(setApps)
      .catch((e) => console.error("Gagal memuat apps:", e))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(apps.map((a) => a.category).filter(Boolean));
    return ["Semua", ...Array.from(set)];
  }, [apps]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return apps.filter((a) => {
      const matchCat = cat === "Semua" || a.category === cat;
      const matchTerm =
        !term ||
        a.title.toLowerCase().includes(term) ||
        a.book_title.toLowerCase().includes(term) ||
        a.author.toLowerCase().includes(term);
      return matchCat && matchTerm;
    });
  }, [apps, q, cat]);

  const heroCovers = apps.slice(0, 4);

  return (
    <main>
      {/* ===== Hero / promosi ===== */}
      <section className="hero container">
        <div className="hero-text">
          <h1>Ubah ide besar dari buku menjadi kebiasaan harian</h1>
          <p>
            Koleksi app yang masing-masing lahir dari sebuah buku. Pilih,
            preview langsung di layar, lalu pakai untuk hidup yang lebih baik.
          </p>
          <div className="hero-cta">
            <a href="#apps" className="btn btn-primary">
              Jelajahi app
            </a>
            {apps.length > 0 && (
              <button
                className="btn btn-ghost"
                onClick={() => setPreview(apps[0])}
              >
                Coba preview
              </button>
            )}
          </div>
        </div>

        <div className="hero-visual">
          <PhoneMockup>
            <div className="mini-app">
              <div className="mini-top">
                <span>📖</span> Reflection
              </div>
              {heroCovers.length > 0 ? (
                <div className="mini-grid">
                  {heroCovers.map((a) => (
                    <img
                      key={a.id}
                      className="mini-cover"
                      src={a.cover_url}
                      alt={a.title}
                    />
                  ))}
                </div>
              ) : (
                <div className="mini-empty">📚</div>
              )}
            </div>
          </PhoneMockup>
        </div>
      </section>

      {/* ===== Katalog ===== */}
      <section id="apps" className="container">
        {!loading && apps.length > 0 && (
          <div className="search-row">
            <input
              type="search"
              placeholder="Cari judul app, buku, atau penulis…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {categories.length > 1 && (
              <div className="search-chips">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`chip ${cat === c ? "active" : ""}`}
                    onClick={() => setCat(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="empty">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-mark">📚</div>
            {apps.length === 0 ? (
              <p>Belum ada app di sini. Tambahkan app pertama lewat panel admin.</p>
            ) : (
              <p>Tidak ada app yang cocok dengan pencarianmu.</p>
            )}
          </div>
        ) : (
          <div className="grid">
            {filtered.map((app) => (
              <AppCard key={app.id} app={app} onPreview={setPreview} />
            ))}
          </div>
        )}
      </section>

      {preview && (
        <PreviewModal app={preview} onClose={() => setPreview(null)} />
      )}
    </main>
  );
}
