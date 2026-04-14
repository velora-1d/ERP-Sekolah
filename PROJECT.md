# ERP Sekolah

## Deskripsi
Sistem Informasi Manajemen Sekolah Terpadu (ERP) yang mencakup modul akademik, penugasan guru, keuangan, dan administrasi siswa.

## Stack Teknologi
- Frontend: Next.js 16.1.6 (App Router)
- Backend: Next.js API Routes (Route Handlers)
- Database: PostgreSQL (Node-Postgres)
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
- Production: Cloudflare Pages (opennextjs-cloudflare)

## Catatan Khusus
- Menggunakan soft delete (`deletedAt`) di sebagian besar tabel.
- Validasi data menggunakan logika kustom dan Zod (di beberapa tempat).
- Integrasi RBAC melalui middleware dan permission registry.

## Progress Terakhir
- Debugging fitur Penugasan Guru (Edit & Hapus).
- Audit API Route Handlers untuk Teaching Assignments.

## Last Updated
2026-03-XX
