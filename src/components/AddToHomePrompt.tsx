import { useEffect, useState } from "react";

type Platform = "ios" | "android" | null;

const LS_KEY = "reflection_a2hs_dismissed";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  // Already running as installed PWA — don't show
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as any).standalone === true);

  if (isStandalone) return null;
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return null;
}

export default function AddToHomePrompt() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  // Android native install prompt event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (localStorage.getItem(LS_KEY)) return;

    const p = detectPlatform();
    if (!p) return;

    // Capture Android native install prompt
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Small delay so user sees the page first
    const t = setTimeout(() => {
      setPlatform(p);
      setVisible(true);
    }, 2000);

    return () => {
      clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(LS_KEY, "1");
    setVisible(false);
  }

  async function installAndroid() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
    } else {
      dismiss();
    }
  }

  if (!visible || !platform) return null;

  return (
    <div className="a2hs-backdrop" onClick={dismiss}>
      <div className="a2hs-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="a2hs-close" onClick={dismiss} aria-label="Tutup">
          ✕
        </button>

        <div className="a2hs-icon">📚</div>
        <h3 className="a2hs-title">Pasang di layar utama</h3>
        <p className="a2hs-sub">
          Buka Reflection kapan saja langsung dari HP-mu, tanpa buka browser.
        </p>

        {platform === "ios" && (
          <ol className="a2hs-steps">
            <li>
              <span className="a2hs-step-icon">1</span>
              Ketuk tombol{" "}
              <strong>
                Bagikan{" "}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "inline", verticalAlign: "middle" }}
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </strong>{" "}
              di bagian bawah Safari
            </li>
            <li>
              <span className="a2hs-step-icon">2</span>
              Gulir ke bawah, pilih <strong>"Tambahkan ke Layar Utama"</strong>
            </li>
            <li>
              <span className="a2hs-step-icon">3</span>
              Ketuk <strong>Tambahkan</strong> — selesai!
            </li>
          </ol>
        )}

        {platform === "android" && (
          <div className="a2hs-android">
            {deferredPrompt ? (
              <button className="btn btn-primary a2hs-btn" onClick={installAndroid}>
                Pasang Sekarang
              </button>
            ) : (
              <ol className="a2hs-steps">
                <li>
                  <span className="a2hs-step-icon">1</span>
                  Ketuk menu <strong>⋮</strong> di pojok kanan atas Chrome
                </li>
                <li>
                  <span className="a2hs-step-icon">2</span>
                  Pilih <strong>"Tambahkan ke layar utama"</strong>
                </li>
                <li>
                  <span className="a2hs-step-icon">3</span>
                  Ketuk <strong>Tambahkan</strong> — selesai!
                </li>
              </ol>
            )}
          </div>
        )}

        <button className="a2hs-skip" onClick={dismiss}>
          Nanti saja
        </button>
      </div>
    </div>
  );
}
