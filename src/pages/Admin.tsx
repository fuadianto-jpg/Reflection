import { useEffect, useState, type FormEvent } from "react";
import {
  listApps,
  deleteApp,
  updateApp,
  getLoggedIn,
  signIn,
  signOut,
} from "../lib/api";
import { isSupabaseConfigured } from "../lib/supabase";
import type { BookApp } from "../types";
import AppForm from "../components/AppForm";

export default function Admin() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    getLoggedIn()
      .then(setAuthed)
      .finally(() => setReady(true));
  }, []);

  if (!ready) return <div className="empty">Memuat…</div>;
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => setAuthed(false)} />;
}

/* -------------------------------- Login -------------------------------- */

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signIn(email, password);
      onLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="panel auth-panel">
        <h2>Masuk Admin</h2>
        {!isSupabaseConfigured && (
          <div className="notice">
            Mode demo (Supabase belum diatur). Masukkan email & password apa saja
            untuk mencoba.
          </div>
        )}
        {error && <div className="alert">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Memproses…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------ Dashboard ------------------------------ */

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [apps, setApps] = useState<BookApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BookApp | null>(null);
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setLoading(true);
    listApps(true)
      .then(setApps)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function onDelete(app: BookApp) {
    if (!confirm(`Hapus "${app.title}"?`)) return;
    await deleteApp(app.id);
    refresh();
  }

  async function toggleStatus(app: BookApp) {
    await updateApp(app.id, {
      status: app.status === "published" ? "draft" : "published",
    });
    refresh();
  }

  async function onLogoutClick() {
    await signOut();
    onLogout();
  }

  const nextOrder =
    apps.reduce((m, a) => Math.max(m, a.sort_order), 0) + 1;

  if (showForm) {
    return (
      <main className="container" style={{ paddingBottom: "4rem" }}>
        <div className="admin-head">
          <h1>{editing ? "Edit App" : "Tambah App"}</h1>
        </div>
        <AppForm
          initial={editing}
          nextOrder={nextOrder}
          onDone={() => {
            setShowForm(false);
            setEditing(null);
            refresh();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingBottom: "4rem" }}>
      <div className="admin-head">
        <h1>Kelola App</h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-amber"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
          >
            + Tambah App
          </button>
          <button className="btn btn-ghost" onClick={onLogoutClick}>
            Keluar
          </button>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="notice">
          Mode demo — perubahan tersimpan di browser ini saja. Atur Supabase di
          file <code>.env</code> untuk menyimpan permanen & live ke publik.
        </div>
      )}

      {loading ? (
        <div className="empty">Memuat…</div>
      ) : apps.length === 0 ? (
        <div className="empty">
          <div className="empty-mark">📚</div>
          <p>Belum ada app. Klik “Tambah App” untuk membuat yang pertama.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="hide-sm">Cover</th>
                <th>App</th>
                <th className="hide-sm">Buku</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id}>
                  <td className="hide-sm">
                    {app.cover_url ? (
                      <img className="row-thumb" src={app.cover_url} alt="" />
                    ) : (
                      <div className="row-thumb" />
                    )}
                  </td>
                  <td>
                    <strong>{app.title}</strong>
                  </td>
                  <td className="hide-sm">{app.book_title}</td>
                  <td>
                    <button
                      className={`status-pill ${
                        app.status === "published"
                          ? "status-published"
                          : "status-draft"
                      }`}
                      onClick={() => toggleStatus(app)}
                      title="Klik untuk ganti status"
                    >
                      {app.status === "published" ? "Tampil" : "Draft"}
                    </button>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="link-btn"
                        onClick={() => {
                          setEditing(app);
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="btn-danger" onClick={() => onDelete(app)}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
