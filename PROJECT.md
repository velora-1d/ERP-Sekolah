# ERP Sekolah

## Deskripsi
Sistem Informasi Manajemen Sekolah Terpadu (ERP) yang mencakup modul akademik, penugasan guru, keuangan, dan administrasi siswa.

## Stack Teknologi
- Frontend: Next.js 16.1.6 (App Router)
- Backend: Next.js API Routes (Route Handlers)
- Database: PostgreSQL (Regular/Standard)
- ORM: Drizzle ORM
- UI/UX: Tailwind CSS v4, SweetAlert2, Lucide React
- State Management: TanStack Query (React Query) v5
- Export/Reporting: jsPDF, XLSX

## Mode Arsitektur
[x] Next.js Fullstack
[ ] Laravel 13 API + Next.js Frontend
[ ] Lainnya: ___

## Target Platform
[x] Web only
[ ] Mobile only
[ ] Web + Mobile

## Multi-tenant
[x] Ya — strategi: single DB dengan tenant_id (tba)
[ ] Tidak

## Skala User
[ ] Kecil (< 100 user)
[x] Menengah (< 10.000 user)
[ ] Besar (> 10.000 user)

## Tim
[x] Solo developer
[ ] Tim — jumlah: ___

## Hosting & Infra
- Development: Local
- Production: Vercel

## Catatan Khusus
- Menggunakan soft delete (`deletedAt`) di sebagian besar tabel.
- Validasi data menggunakan logika kustom dan Zod (di beberapa tempat).
- Integrasi RBAC melalui middleware dan permission registry.

## Progress Terakhir
- Implementasi metrik dashboard dinamis (KPI trend & charts).
- Perbaikan error Cloudflare Edge Runtime.
- Migrasi middleware ke proxy logic.
- Penambahan integrasi Database Unique Constraints dan validasi duplikasi pada CRUD Surat, Siswa, Pegawai, dan Inventaris.
- Sinkronisasi penyimpanan field Surat (Tahun Ajaran/Semester) pada operasi Update.
- Menginisialisasi setup proyek ERP-Sekolah setelah kloning baru: membuat environment file (`.env`, `.env.local`, `.env.production`), menginstal Node packages, dan mengonfigurasi database `erp_sekolah_db`.
- Menjalankan Drizzle migrations (`npm run db:migrate`) untuk membuat 56 tabel database.
- Memverifikasi build Next.js (`npm run build`) berjalan sukses secara menyeluruh.
- Perbaikan modul kurikulum: menghapus ketergantungan client ke Server Action dan memindahkan reset kurikulum ke Route Handler agar stabil saat deployment Vercel.
- Redesign halaman kurikulum: ringkasan periode lebih akurat, tahun ajaran tidak lagi hardcoded, komponen nilai dan KKM dimuat sesuai periode aktif.
- Menonaktifkan cache GET untuk endpoint kurikulum, komponen nilai, dan KKM agar refetch admin selalu mengambil data terbaru setelah simpan/reset.

## Last Updated
2026-06-01
