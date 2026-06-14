import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listApps } from "../lib/api";
import type { BookApp } from "../types";
import PhoneMockup from "../components/PhoneMockup";

export default function Landing() {
  const [apps, setApps] = useState<BookApp[]>([]);

  useEffect(() => {
    listApps()
      .then(setApps)
      .catch((e) => console.error("Gagal memuat apps:", e));
  }, []);

  const covers = apps.slice(0, 4);

  return (
    <main>
      {/* ===== Hero ===== */}
      <section className="hero container">
        <div className="hero-text">
          <span className="eyebrow">Koleksi app dari buku</span>
          <h1>Ubah ide besar dari buku menjadi kebiasaan harian</h1>
          <p>
            Reflection mengumpulkan app yang masing-masing lahir dari sebuah
            buku. Coba langsung di layar, lalu pakai untuk hidup yang lebih baik.
          </p>
          <div className="hero-cta">
            <Link to="/apps" className="btn btn-primary">
              Lihat semua app
            </Link>
            <a href="#cara" className="btn btn-ghost">
              Cara kerja
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <PhoneMockup>
            <div className="mini-app">
              <div className="mini-top">
                <span>📖</span> Reflection
              </div>
              {covers.length > 0 ? (
                <div className="mini-grid">
                  {covers.map((a) => (
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

      {/* ===== Features ===== */}
      <section className="section alt">
        <div className="container">
          <h2 className="section-title">Kenapa Reflection?</h2>
          <div className="features">
            <div className="feature">
              <div className="feature-ic">📚</div>
              <h3>Lahir dari buku</h3>
              <p>
                Tiap app menerjemahkan prinsip sebuah buku jadi alat yang bisa
                langsung dipakai.
              </p>
            </div>
            <div className="feature">
              <div className="feature-ic">📱</div>
              <h3>Preview langsung</h3>
              <p>Coba app di dalam mockup iPhone tanpa perlu instal apa pun.</p>
            </div>
            <div className="feature">
              <div className="feature-ic">✨</div>
              <h3>Selalu bertambah</h3>
              <p>
                Koleksi terus diperbarui dengan app baru dari buku-buku pilihan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="section" id="cara">
        <div className="container">
          <h2 className="section-title">Cara kerja</h2>
          <div className="steps">
            <div className="step">
              <span className="step-no">1</span>
              <div>
                <h3>Pilih app</h3>
                <p>Telusuri koleksi & cari berdasarkan buku atau penulis.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-no">2</span>
              <div>
                <h3>Preview di layar</h3>
                <p>Lihat app langsung dalam mockup iPhone sebelum memakai.</p>
              </div>
            </div>
            <div className="step">
              <span className="step-no">3</span>
              <div>
                <h3>Pakai harian</h3>
                <p>Buka penuh & jadikan bagian dari kebiasaanmu.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA band ===== */}
      <section className="cta-band">
        <div className="container">
          <h2>Siap menemukan app-mu?</h2>
          <Link to="/apps" className="btn btn-amber">
            Jelajahi koleksi →
          </Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">
          © {new Date().getFullYear()} Reflection — app yang lahir dari buku.
        </div>
      </footer>
    </main>
  );
}
