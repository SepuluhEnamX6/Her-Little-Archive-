# Her Little Archive ♡

Website personal bergaya **digital memory archive** untuk menyimpan foto, catatan, favorit, musik, dan kenangan tentang seseorang yang spesial.

Nuansa desain dibuat lembut dan dreamy dengan kombinasi **pink, biru, lavender, liquid glass, bunga yang mengikuti cursor**, serta **dark mode** sebagai tema utama.

## ✨ Fitur Utama

### 📸 Gallery
- Menampilkan foto dari Supabase.
- Mendukung kategori foto: pretty, cute, random, outfit.
- Foto dapat ditandai sebagai **Favorite**.
- Satu foto dapat ditandai sebagai **Hero photo**.
- Hero photo dapat berganti otomatis.
- Admin dapat upload, edit, dan menghapus foto.
- Upload foto menggunakan Supabase Storage.

### 💌 Unsent Notes
- Menampilkan catatan personal.
- Admin dapat menambah, mengedit, menghapus, dan menyembunyikan catatan.
- Data catatan tersimpan di tabel `notes`.

### ⭐ Favorites
- Menyimpan ranking hal-hal favorit.
- Mendukung deskripsi, rating, dan urutan.
- Admin dapat menambah, mengedit, dan menghapus ranking.

### ⚙️ Admin Settings
Admin dapat mengatur:
- Judul website.
- Bahasa default ID / EN.
- Dark mode default.
- URL musik.
- Volume musik.
- Tanggal dan jam `Since We Met`.

### 🎵 Background Music
- Musik latar menggunakan file lokal di `assets/`.
- Terdapat tombol play/pause yang mengambang di kanan bawah.
- Website mencoba autoplay, lalu menggunakan fallback setelah interaksi pengguna jika browser memblokir autoplay.

### 🌷 Visual Effects
- Liquid glass.
- Aksen pink + biru.
- Dark mode.
- Bunga kecil mengikuti cursor.
- Animasi hero card.
- Efek heart / sparkle.
- Responsive desktop dan mobile.

## 🗂️ Struktur Project

```text
her-little-archive/
├── index.html
├── style.css
├── script.js
├── ADMIN_SETUP.md
├── SUPABASE_ADMIN_SETUP.sql
└── assets/
    ├── memory-01.jpg
    ├── memory-02.jpg
    ├── memory-03.jpg
    ├── memory-04.jpg
    ├── memory-05.jpg
    ├── memory-06.jpg
    └── surat-cinta-untuk-starla.mp3
```

## ☁️ Supabase

Project menggunakan Supabase untuk database dan file storage.

### Tabel yang digunakan

```text
photos
notes
favorites
settings
admin_users
```

### Storage bucket

```text
photos
```

Bucket `photos` digunakan untuk menyimpan file gambar yang kemudian direferensikan oleh kolom `image_url` pada tabel `photos`.

## 🔐 Admin Setup

1. Buka **Supabase → Authentication → Users**.
2. Buat akun email/password untuk admin.
3. Buka **SQL Editor**.
4. Buka file `SUPABASE_ADMIN_SETUP.sql`.
5. Ganti:

```sql
admin_email text := 'YOUR_ADMIN_EMAIL';
```

menjadi email admin yang sudah dibuat.

6. Jalankan seluruh SQL tersebut.
7. Buka website.
8. Tekan tombol **⚙ Settings** dan login dengan akun admin.

RLS digunakan agar pengunjung biasa hanya membaca data, sedangkan operasi tambah/edit/hapus hanya dapat dilakukan oleh admin.

## 🌐 Menjalankan Secara Lokal

Disarankan menggunakan **VS Code + Live Server**.

Langkah:

1. Extract project.
2. Buka folder project di VS Code.
3. Klik kanan `index.html`.
4. Pilih **Open with Live Server**.

Jangan membuka `index.html` langsung dengan `file://` karena beberapa fitur browser dan Supabase membutuhkan origin HTTP/HTTPS.

## 🔧 Konfigurasi Supabase

Konfigurasi Supabase berada di bagian atas `script.js`:

```js
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";
```

Gunakan **publishable key / anon key**, bukan `service_role` key di browser.

## 📱 Responsive

Website sudah disesuaikan untuk desktop dan mobile, termasuk:
- navbar mobile + hamburger menu,
- bahasa ID / EN di mobile,
- floating music button,
- admin panel mobile,
- form admin satu kolom pada layar kecil.

## 🎨 Tema

Palet utama:

```text
Pink     → aksen romantis
Blue     → warna favorit tambahan
Lavender → dreamy / soft
Dark     → default mode
```

## ⚠️ Catatan

- Pastikan file gambar berada di Supabase Storage dan URL-nya tersimpan pada tabel `photos`.
- Pastikan RLS dan policy admin sudah dijalankan dari `SUPABASE_ADMIN_SETUP.sql`.
- Autoplay audio dapat dibatasi browser. Tombol musik tetap tersedia sebagai fallback.
- Gunakan file musik yang kamu punya hak untuk digunakan pada website.

## 💗 Konsep

> A very small corner of the internet, made quietly for her.

**Her Little Archive ♡ · 2026**
