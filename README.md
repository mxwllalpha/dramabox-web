# DramaBox - Streaming Drama Pendek Indonesia 🎬

Aplikasi streaming drama pendek gratis dengan dukungan **11 bahasa** dan Progressive Web App (PWA) ready.

**[🔗 Live Demo - DramaBox](https://dramabox-web-seven.vercel.app/)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmxwllalpha%2Fdramabox-web)

## ✨ Fitur Utama

### 🌍 Dukungan 11 Bahasa
- **Indonesia** (Bahasa Indonesia) - Default
- **English** (United States)
- **Thai** (ภาษาไทย)
- **Arabic** (العربية)
- **Portuguese** (Português) - Brazil
- **French** (Français)
- **German** (Deutsch)
- **Japanese** (日本語)
- **Spanish** (Español)
- **Chinese Traditional** (繁體中文) - Taiwan
- **Chinese Simplified** (简体中文) - China

### 📱 Bisa Jadi Aplikasi (PWA)
- **Install ke HP**: Tambah ke home screen Android/iOS
- **Offline Mode**: Bisa dibuka tanpa internet
- **Notifikasi**: Dapat notifikasi drama baru
- **Cepat**: Loading super cepat dengan caching

### 🎬 Konten Drama
- **Untuk Kamu**: Rekomendasi drama sesuai selera
- **Terbaru**: Drama terbaru yang baru rilis
- **Terpopuler**: Drama yang sedang trending
- **Sulih Suara**: Drama dengan dubbing bahasa Indonesia
- **Pencarian**: Cari drama berdasarkan judul
- **Detail Lengkap**: Sinopsis, tag, dan daftar episode

## 🚀 Cara Pakai (Sudah Jadi)

Cukup buka **[dramabox-web-seven.vercel.app](https://dramabox-web-seven.vercel.app/)** dan langsung nonton!

### Install ke HP (Agar Seperti Aplikasi)

**Android (Chrome):**
1. Buka di Chrome
2. Ketuk menu (⋮) → "Tambahkan ke Layar Utama"
3. Ketuk "Tambahkan"

**iPhone/iPad (Safari):**
1. Buka di Safari
2. Ketuk tombol Share (⎙) → "Tambahkan ke Layar Utama"
3. Ketuk "Tambahkan"

## 🛠️ Buat Sendiri (Untuk Developer)

### Cara Paling Mudah - One-Click Deploy

1. Klik tombol **Deploy with Vercel** di atas
2. Connect dengan GitHub
3. Tunggu deployment selesai
4. Selesai! Aplikasi live dalam beberapa menit

### Local Development

```bash
# Clone repository
git clone https://github.com/mxwllalpha/dramabox-web.git
cd dramabox-web

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📦 Tech Stack

| Teknologi | Kegunaan |
|-----------|----------|
| **Next.js 16** | Framework React buatan Vercel |
| **TypeScript** | Agar kode tidak mudah error |
| **Tailwind CSS** | Styling agar tampilan bagus |
| **shadcn/ui** | Komponen UI yang siap pakai |
| **TanStack Query** | Mengambil data dan caching |

## 🏷️ Tags

#nextjs #react #typescript #tailwindcss #pwa #progressive-web-app #streaming #drama #indonesia #mobile-first #vercel

---

## 🙏 Credit to Original Project

**Repository ini adalah fork/modifikasi dari [Slavecode/dramabox](https://github.com/Slavecode/dramabox)**

Terima kasih kepada **[Slavecode](https://github.com/Slavecode)** atas project dasar yang inspiratif!

### Perubahan yang Dilakukan

- **API Berbeda**: Menggunakan API yang support multi-bahasa
- **11 Bahasa**: Dukungan penuh multi-bahasa dengan routing dinamis
- **PWA Ready**: Bisa di-install ke HP, offline support
- **Mobile UX**: Navigasi bawah, pull-to-refresh, interface touch-friendly

### Original Repository
- **[🔗 Slavecode/dramabox](https://github.com/Slavecode/dramabox)** - Silakan star repo original juga!

---

## 📝 Script Commands

| Command | Keterangan |
|---------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run type-check` | Cek error TypeScript |

## 🌐 Deployment ke Vercel

### Environment Variables (Opsional)

Jika ingin customize, tambahkan di Vercel Dashboard:

```bash
UPSTREAM_API=https://api.megawe.net
DEFAULT_LANGUAGE=in
```

**Catatan**: Tanpa environment variables pun aplikasi akan tetap jalan dengan default settings.

### Deploy Gratis (Vercel Hobby)

| Fitur | Hobby Plan | Status |
|-------|------------|--------|
| Deployment | ✅ Full support | Aktif |
| Custom Domain | ✅ Unlimited | Aktif |
| Serverless Functions | 100h/bulan | Aktif |

## 📄 Lisensi

Project ini open source dengan [MIT License](LICENSE).

---

Dibuat dengan ❤️ untuk pecinta drama Indonesia

**Live Demo**: [dramabox-web-seven.vercel.app](https://dramabox-web-seven.vercel.app/) | **Repository**: [github.com/mxwllalpha/dramabox-web](https://github.com/mxwllalpha/dramabox-web)
