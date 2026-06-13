import {
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  listApps,
  deleteApp,
  updateApp,
  getLoggedIn,
  signIn,
  signOut,
} from "../lib/api";
import { isFirebaseConfigured } from "../lib/firebase";
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
        {!isFirebaseConfigured && (
          <div className="notice">
            Mode demo (Firebase belum diatur). Masukkan email & password apa saja
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = apps.findIndex((a) => a.id === active.id);
    const newIndex = apps.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(apps, oldIndex, newIndex).map((a, i) => ({
      ...a,
      sort_order: i + 1,
    }));
    setApps(reordered); // optimistic update

    // persist only the rows whose order actually changed
    const changed = reordered.filter(
      (a, i) => apps.find((p) => p.id === a.id)?.sort_order !== i + 1
    );
    try {
      await Promise.all(
        changed.map((a) => updateApp(a.id, { sort_order: a.sort_order }))
      );
    } catch (err) {
      console.error("Gagal menyimpan urutan:", err);
      refresh(); // revert to server state on failure
    }
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

      {!isFirebaseConfigured && (
        <div className="notice">
          Mode demo — perubahan tersimpan di browser ini saja. Atur Firebase di
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
        <>
          <p className="reorder-hint">
            Geser <span className="grip">⠿</span> untuk mengatur urutan tampil di
            halaman utama (paling atas = muncul pertama).
          </p>
          <div className="table-wrap">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <table>
                <thead>
                  <tr>
                    <th aria-label="Urutan" />
                    <th className="hide-sm">Cover</th>
                    <th>App</th>
                    <th className="hide-sm">Buku</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <SortableContext
                    items={apps.map((a) => a.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {apps.map((app) => (
                      <SortableRow
                        key={app.id}
                        app={app}
                        onToggle={() => toggleStatus(app)}
                        onEdit={() => {
                          setEditing(app);
                          setShowForm(true);
                        }}
                        onDelete={() => onDelete(app)}
                      />
                    ))}
                  </SortableContext>
                </tbody>
              </table>
            </DndContext>
          </div>
        </>
      )}
    </main>
  );
}

/* ----------------------------- Sortable row ----------------------------- */

function SortableRow({
  app,
  onToggle,
  onEdit,
  onDelete,
}: {
  app: BookApp;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
    background: isDragging ? "var(--pasir)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="drag-cell">
        <button
          type="button"
          className="drag-handle"
          aria-label="Geser untuk atur urutan"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </td>
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
            app.status === "published" ? "status-published" : "status-draft"
          }`}
          onClick={onToggle}
          title="Klik untuk ganti status"
        >
          {app.status === "published" ? "Tampil" : "Draft"}
        </button>
      </td>
      <td>
        <div className="row-actions">
          <button className="link-btn" onClick={onEdit}>
            Edit
          </button>
          <button className="btn-danger" onClick={onDelete}>
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}
