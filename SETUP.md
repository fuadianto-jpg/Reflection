# Book-to-App Hub — Setup

Galeri publik berisi semua app yang terinspirasi dari buku berbeda, dengan panel
admin untuk menambah/edit/hapus app (upload cover + URL).

## Jalankan (mode demo, tanpa setup)

```bash
npm install
npm run dev
```

Buka http://localhost:5173

- `/` — galeri publik
- `/admin` — login admin (mode demo: email & password apa saja)

Di mode demo, data app & cover tersimpan di **browser** (localStorage). Cocok untuk
mencoba tampilan. Untuk data permanen yang live ke semua pengunjung, atur Supabase
di bawah.

---

## Aktifkan Supabase (data permanen)

### 1. Buat project
1. Daftar di [supabase.com](https://supabase.com), buat project baru.
2. Salin **Project URL** dan **anon public key** (Settings → API).
3. Isi ke file `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 2. Buat tabel + keamanan
Jalankan SQL ini di Supabase → SQL Editor:

```sql
create table apps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  book_title text not null,
  author text not null,
  url text not null,
  cover_url text,
  accent_color text,
  text_color text,
  category text,
  status text not null default 'published',
  sort_order int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table apps enable row level security;

-- Publik hanya boleh membaca app yang published
create policy "public read published" on apps
  for select using (status = 'published');

-- Admin (login) boleh baca semua + tulis
create policy "admin read all" on apps
  for select to authenticated using (true);
create policy "admin write" on apps
  for all to authenticated using (true) with check (true);
```

### 3. Storage untuk cover
1. Storage → New bucket → nama `covers`, centang **Public bucket**.
2. Tambah policy agar pengguna login bisa upload:

```sql
create policy "admin upload covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'covers');
```

### 4. Buat akun admin
Authentication → Users → Add user (email + password). Pakai akun ini untuk login
di `/admin`.

Restart `npm run dev` setelah mengubah `.env`.

---

## Deploy (Vercel)
1. Push ke GitHub.
2. Import repo di [vercel.com/new](https://vercel.com/new).
3. Tambahkan env `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Tambahkan rewrite untuk SPA (file `vercel.json` sudah disertakan).
