import { useMemo, useState, type FormEvent } from "react";
import { createApp, updateApp, uploadCover } from "../lib/api";
import { generateCoverSvg } from "../lib/cover";
import type { AppInput, BookApp } from "../types";

interface Props {
  initial?: BookApp | null;
  nextOrder: number;
  onDone: () => void;
  onCancel: () => void;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type CoverMode = "generate" | "upload";

export default function AppForm({ initial, nextOrder, onDone, onCancel }: Props) {
  const [form, setForm] = useState<AppInput>({
    title: initial?.title ?? "",
    book_title: initial?.book_title ?? "",
    author: initial?.author ?? "",
    url: initial?.url ?? "",
    cover_url: initial?.cover_url ?? "",
    accent_color: initial?.accent_color ?? "#1a4b28",
    text_color: initial?.text_color ?? "#f8f3e6",
    category: initial?.category ?? "",
    status: initial?.status ?? "published",
    sort_order: initial?.sort_order ?? nextOrder,
  });

  // Default to upload only if editing an app that has a real uploaded image
  const [mode, setMode] = useState<CoverMode>(
    initial?.cover_url && !initial.cover_url.startsWith("data:image/svg")
      ? "upload"
      : "generate"
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof AppInput>(k: K, v: AppInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Live auto-generated cover preview
  const generatedCover = useMemo(
    () =>
      generateCoverSvg({
        title: form.title,
        book: form.book_title,
        author: form.author,
        bg: form.accent_color,
        text: form.text_color,
      }),
    [form.title, form.book_title, form.author, form.accent_color, form.text_color]
  );

  async function onPickFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG/PNG/WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Ukuran gambar maksimal 5 MB.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const url = await uploadCover(file);
      set("cover_url", url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload cover gagal.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^https?:\/\//.test(form.url)) {
      setError("URL app harus diawali http:// atau https://");
      return;
    }

    // Resolve final cover based on selected mode
    const payload: AppInput = { ...form };
    if (mode === "generate") {
      payload.cover_url = generatedCover;
    } else if (!payload.cover_url) {
      setError("Upload cover dulu, atau pilih mode Generate otomatis.");
      return;
    }

    setBusy(true);
    try {
      if (initial) await updateApp(initial.id, payload);
      else await createApp(payload);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel" onSubmit={onSubmit} style={{ maxWidth: 720 }}>
      <h2>{initial ? "Edit App" : "Tambah App"}</h2>

      {error && <div className="alert">{error}</div>}

      <div className="form-grid">
        <div className="field">
          <label>Judul app *</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="mis. Merdeka"
            required
          />
        </div>
        <div className="field">
          <label>URL app *</label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => set("url", e.target.value)}
            placeholder="https://…"
            required
          />
        </div>
        <div className="field">
          <label>Judul buku *</label>
          <input
            value={form.book_title}
            onChange={(e) => set("book_title", e.target.value)}
            placeholder="mis. Atomic Habits"
            required
          />
        </div>
        <div className="field">
          <label>Penulis *</label>
          <input
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            placeholder="mis. James Clear"
            required
          />
        </div>
      </div>

      {/* ===== Cover ===== */}
      <div className="field">
        <label>Cover</label>
        <div className="cover-tabs">
          <button
            type="button"
            className={`cover-tab ${mode === "generate" ? "active" : ""}`}
            onClick={() => setMode("generate")}
          >
            ✨ Generate otomatis
          </button>
          <button
            type="button"
            className={`cover-tab ${mode === "upload" ? "active" : ""}`}
            onClick={() => setMode("upload")}
          >
            ⬆ Upload gambar
          </button>
        </div>

        {mode === "generate" ? (
          <div className="cover-gen">
            <img
              className="cover-preview lg"
              src={generatedCover}
              alt="Preview cover"
            />
            <div className="cover-gen-controls">
              <div className="field">
                <label>Warna tema</label>
                <input
                  type="color"
                  value={form.accent_color}
                  onChange={(e) => set("accent_color", e.target.value)}
                  style={{ height: 42, padding: 4 }}
                />
              </div>
              <div className="field">
                <label>Warna tulisan</label>
                <input
                  type="color"
                  value={form.text_color}
                  onChange={(e) => set("text_color", e.target.value)}
                  style={{ height: 42, padding: 4 }}
                />
              </div>
              <div className="hint">
                Cover dibuat otomatis dari judul, buku, penulis & warna di atas.
              </div>
            </div>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <div className="hint">JPG/PNG/WebP, maksimal 5 MB.</div>
            {uploading && <div className="hint">Mengupload…</div>}
            {form.cover_url && !form.cover_url.startsWith("data:image/svg") && (
              <img className="cover-preview" src={form.cover_url} alt="Preview cover" />
            )}
          </div>
        )}
      </div>

      <div className="form-grid">
        <div className="field">
          <label>Kategori</label>
          <input
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="mis. Produktivitas"
          />
        </div>
        <div className="field">
          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as AppInput["status"])}
          >
            <option value="published">Tampil</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="field">
          <label>Urutan</label>
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy || uploading}>
          {busy ? "Menyimpan…" : "Simpan"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Batal
        </button>
      </div>
    </form>
  );
}
