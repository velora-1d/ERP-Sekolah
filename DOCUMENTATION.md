# DOKUMENTASI LENGKAP & MANUAL OPERASIONAL EDUVERA (ERP SEKOLAH)
*Berdasarkan FAQ Sistem & Urutan Menu Sidebar Resmi*

---

## DAFTAR ISI SESUAI SIDEBAR
1. [UTAMA](#1-utama)
   - [Dashboard](#11-dashboard)
2. [PENERIMAAN](#2-penerimaan)
   - [Penerimaan PPDB](#21-penerimaan-ppdb)
   - [Daftar Ulang](#22-daftar-ulang)
3. [DATA MASTER](#3-data-master)
   - [Data Siswa](#31-data-siswa)
   - [Mutasi & Kenaikan](#32-mutasi--kenaikan)
   - [Kelas](#33-kelas)
   - [Tahun Ajaran](#34-tahun-ajaran)
   - [Kategori Keuangan](#35-kategori-keuangan)
4. [AKADEMIK](#4-akademik)
   - [Mata Pelajaran](#41-mata-pelajaran)
   - [Penugasan Guru](#42-penugasan-guru)
   - [Jadwal Pelajaran](#43-jadwal-pelajaran)
   - [Absensi Siswa](#44-absensi-siswa)
   - [Manajemen Kurikulum](#45-manajemen-kurikulum)
   - [Input Nilai Siswa](#46-input-nilai-siswa)
   - [Rapor Digital](#47-rapor-digital)
   - [Ekstrakurikuler](#48-ekstrakurikuler)
   - [Bimbingan Konseling](#49-bimbingan-konseling)
   - [Kalender Akademik](#410-kalender-akademik)
5. [KEUANGAN](#5-keuangan)
   - [Infaq / SPP](#51-infaq--spp)
   - [Tabungan Siswa](#52-tabungan-siswa)
   - [Wakaf & Donasi](#53-wakaf--donasi)
   - [Jurnal Umum](#54-jurnal-umum)
   - [Laporan](#55-laporan)
6. [SDM](#6-sdm)
   - [Data Guru](#61-data-guru)
   - [Data Staf](#62-data-staf)
   - [Payroll](#63-payroll)
   - [Inventaris](#64-inventaris)
7. [KOPERASI](#7-koperasi)
   - [Produk Koperasi](#71-produk-koperasi)
   - [Transaksi / Kasir](#72-transaksi--kasir)
   - [Piutang Siswa](#73-piutang-siswa)
8. [TATA USAHA](#8-tata-usaha)
   - [Absensi Pegawai](#81-absensi-pegawai)
   - [Manajemen Surat](#82-manajemen-surat)
   - [Pengumuman](#83-pengumuman)
   - [Profil Sekolah](#84-profil-sekolah)
9. [SISTEM](#9-sistem)
   - [Pengaturan](#91-pengaturan)

---

## 1. UTAMA

### 1.1 Dashboard (`/dashboard`)
**Deskripsi**: Halaman utama (Beranda) setelah Anda berhasil login. Berfungsi sebagai pusat komando yang memberikan ikhtisar (overview) menyeluruh terhadap semua kegiatan sekolah mulai dari kependidikan hingga aliran keuangan (bagi yang memiliki hak akses relevan).

**Fitur & Cara Penggunaan**:
- **Penjelasan Menu & Alur Standard (User Flow)**:
  1. Setiap pengguna (Admin, Guru, Kepala Sekolah) masuk melalui form login.
  2. Setelah autentikasi sukses, Anda diarahkan kemari.
  3. Sistem memproses widget-widget secara real-time berdasarkan kewenangan peran Anda (Role Based Access Control).
  4. Jika layar tidak menampilkan angka, sistem mungkin sedang menghitung kalkulasi data yang sedang berjalan.
- **Cara Penggunaan Fitur Widget Statistik**:
  1. Lihat kartu-kartu angka di atas untuk ringkasan padat (Misal: Jumlah Siswa, Kas Masuk bulan ini).
  2. Widget tidak bisa di-klik untuk mengedit data; namun menyajikan agregasi mutlak dari ribuan entri di database.
  3. Bila ada kejanggalan pada metrik, periksalah pada Menu Data Master atau Laporan.
- **Cara Membaca Grafik**:
  1. Terdapat chart / grafik yang membandingkan pendapatan (Infaq) terhadap pengeluaran harian/bulanan.
  2. Arahkan (hover) kursor tetikus Anda pada lengkungan garis atau batang (bar) untuk melihat selisih riil pendapatan pada tanggal tertentu.

**Informasi Tambahan (QA Validasi)**:
- Catatan Keamanan: Modul Keuangan pada Dashboard dikunci (hidden) terhadap akun tipe Guru/Staf biasa.
- QA Validasi: Jika Anda berpindah Role dari Staf ke Admin via sistem, tekan tombol muat ulang (refresh) browser Anda agar statistik rekap ulang.

---

## 2. PENERIMAAN

### 2.1 Penerimaan PPDB (`/ppdb`)
**Deskripsi**: Modul khusus Penerimaan Peserta Didik Baru (PPDB). Memfasilitasi sekolah dalam menampung formulir pendaftar, seleksi administrasi, hingga peresmian menjadi Siswa Aktif saat ajaran baru masuk.

**Fitur & Cara Penggunaan**:
- **Penjelasan & Flow Penerimaan Masuk**:
  1. Pendaftaran dapat dilakukan oleh calon murid dari luar, atau didaftarkan manual oleh panitia PPDB dari dalam panel ini.
  2. Lalu formulir tersimpan dalam status 'Pending'.
  3. Panitia wajib meneliti validitas berkas (Ijazah, Akta, dll).
  4. Jika berkas valid, Kepala Sekolah / Ketua Panitia mengganti status menjadi 'Lulus'.
  5. Siswa 'Lulus' ini otomatis dikonversi ke dalam Database Siswa Induk (Data Master).
- **Cara Tambah Pendaftar**:
  1. Klik tombol 'Tambah Pendaftar' di kanan atas layar.
  2. Ketikan Nomor Induk Kependudukan (NIK - 16 Digit).
  3. Isi formulir isian Biodata, Jalur Penerimaan, dan Orang Tua.
  4. Lalu tekan 'Simpan'.
- **Cara Validasi & Penerimaan**:
  1. Cari nama anak yang akan diseleksi pada grid tabel.
  2. Buka formulir edit (ikon Pensil).
  3. Ubah field status dari 'Pending' menjadi 'Lulus/Diterima'.
  4. Sistem menkonfirmasi untuk migrasi profil, klik 'OK/Simpan' memproses.

**Informasi Tambahan (QA Validasi)**:
- QA Validasi: Data NIK wajib hukumnya dan tak boleh ada 2 NIK sama yang didaftarkan. Penginputan pendaftar dengan NIK ganda langsung di-reject.
- Konversi Data Aktif: Murid di tabel ini belum bertindak sebagai murid aktif. Jangan heran jika tidak muncul di absen; karena untuk masuk absen harus 'Lulus' lalu dimasukkan dalam Mapping Kelas oleh admin.

### 2.2 Daftar Ulang (`/re-registration`)
**Deskripsi**: Menu pembayaran dan konfirmasi penempatan ulang pasca penerimaan atau pasca kenaikan jenjang. Fungsi utamanya adalah validasi ikatan kewajiban bayar dimuka.

**Fitur & Cara Penggunaan**:
- **Penjelasan & Alur Form Daftar Ulang**:
  1. List ini menampilkan siapa saja murid yang 'Lulus PPDB' tapi belum membayar Daftar Ulang.
  2. Setiap pendaftar akan diberi kewajiban biaya rincian daftar ulang (misal: Seragam, Buku).
  3. Ketika orangtua transfer, panitia mencatat pelunasan lewat sini.
  4. Setelah dilunasi, baris siswa ini berpindah status menjadi Hijau (Selesai).
- **Cara Merekam Pembayaran Daftar Ulang**:
  1. Lihat deretan baris siswa, cari nama yang dituju.
  2. Tekan tombol aksi berwarna (Bayar/Daftar Ulang).
  3. Isi nominal setor uang tunai / transfer bank yang diterima kasir.
  4. Selesaikan verifikasi transaksi dengan menekan tombol Lunas.

**Informasi Tambahan (QA Validasi)**:
- Integrasi Ledger Keuangan: Ketika panitia menekan 'Lunas' di layar ini, nominal pembayaran tersebut mutlak dicatat otomatis ke Jurnal Umum bagian Pemasukan (Kategori: Daftar Ulang).

---

## 3. DATA MASTER

### 3.1 Data Siswa (`/students`)
**Deskripsi**: Database pusat (The Single Source of Truth) untuk seluruh riwayat, personalia, akademis, dan histori catatan Siswa aktif sekolah berjalan.

**Fitur & Cara Penggunaan**:
- **Alur Data Induk Siswa**:
  1. Siswa masuk entah lewat PPDB Terintegrasi, atau diketik manual oleh Staff TU (Tata Usaha).
  2. Profil siswa memiliki Nomer Induk Siswa (NIS) lokal dan NISN (Nasional).
  3. Selama anak ini Aktif, namanya akan selalu menempel pada raport dan presensi.
  4. Apabila ia Lulus atau Pindah pindah sekolah, kita WAJIB menggunakan menu 'Mutasi & Kenaikan' agar dia raib dari daftar, demi kerapihan data.
- **Cara Entri Siswa Manual**:
  1. Pada pojok kanan form, klik 'Tambah Siswa'.
  2. Jawab pertanyaan isian dari Tab Identitas Pribadi, Alamat tinggal, sampai Wali Orang Tua.
  3. Input field NIS sebagai id absolut anak di lembaga kita.
  4. Simpan. Jika data benar, row baru akan mengembang di tabel indeks.
- **Cara Mengedit Profil atau Koreksi Salah Ketik**:
  1. Bilik pencarian di atas (Kaca pembesar) dapat digunakan mencari NIS / Nama.
  2. Temukan siswa, klik lambang Edit (biasanya bergerigi/pensil hijau).
  3. Edit form huruf Ejaan yang keliru. Setelah beres, update tekan Simpan.
  4. Semua raport dan kartu absen yang belum dicetak hari ini akan secara instan berubah nama aslinya sesuai ejaan perbaikan Anda.

**Informasi Tambahan (QA Validasi)**:
- QA Validasi Unikitas: Memasukkan NIS (cth: 1234) yang sudah dihuni oleh anak lain tidak ditolerir. Sistem membatalkan perintah Update anda.
- Klausa Deletion: Mendelete data master siswa sangat tidak dianjurkan. Praktik standar adalah Me-Mutasi / merubah statusnya NonAktif supaya historikal rapotnya tidak patah.

### 3.2 Mutasi & Kenaikan (`/mutations`)
**Deskripsi**: Akan selalu ada masa dimana murid pindah dari sekolah kita, diberhentikan (drop out), ataupun sudah saat kelulusan akhir. Panel ini adalah tombol saklarnya.

**Fitur & Cara Penggunaan**:
- **Penjelasan Logika Mutasi**:
  1. Kondisi Mutasi Permanen: Seorang siswa dipindah sekolah.
  2. Kondisi Mutasi Selesai (Lulusan): Sekumpulan kelas diwisuda.
  3. Setelah form Mutasi ini diketuk palu, seluruh rekaman atas siswa tersebut resmi Dihentikan.
  4. Berarti besok harinya, nama dia musnah / gaib dari Presensi (absen) maupun Rapor sekolah hari ini.
- **Cara Mengeluarkan / Meluluskan Anak**:
  1. Muka halaman ini menampilkan form pencarian siswa.
  2. Cari by Nama atau NIS.
  3. Pilih tombol 'Mutasikan/Keluarkan'.
  4. Beri 'Status' keluarnya: Lulus, Pindah Sekolah, Berhenti, Dikeluarkan, Wafat.
  5. Isi baris 'Alasan spesifik' / Catatan (Cth: Pindah ke surabaya ikut bapak dinas).
  6. Kirim perintah (Submit). Proses mutasi ditandatangani final oleh sistem.

**Informasi Tambahan (QA Validasi)**:
- Tidak Bisa Undo Mutasi: Harap berhati-hati. Selevel Anda meluluskan siswa, anak itu sudah bukan domain Master Siswa Aktif lagi. Butuh campur tangan IT Admin mengubah di Database Raw untuk merestore kesalahan kelalaian mutasi masif.

### 3.3 Kelas (`/classrooms`)
**Deskripsi**: Indeks daftar kamar belajar atau rombongan belajar (Rombel) yang ada di naungan institusi.

**Fitur & Cara Penggunaan**:
- **Penjelasan Relasi Rombel**:
  1. Kelas ibarat cangkang kosong (Misal 'VII-A').
  2. Cangkang ini kelak akan diisi oleh Siswa-siswi ketika staff Anda melakukan plotting.
  3. Setiap Kelas wajib punya penanggung jawab (Wali Kelas) yang posisinya menjamin keamanan rapot di akhir semester.
- **Cara Membuka Kelas Baru**:
  1. Pastikan di 'Data Guru / SDM' para tenaga pendidik sudah di-input dahulu.
  2. Lalu klik Tambah Kelas di modul ini.
  3. Tulis Nama Rombel, misal 'Kelas 7 Reguler B'.
  4. Pilih Wali Kelas dari kumpulan Dropdown yang muncul (Menyepuhkan master Guru tadi).
  5. Simpan.
- **Cara Mengganti Wali Kelas Tiap Semester**:
  1. Buka list kelas, lalu klik simbol Edit (Pena).
  2. Di Dropdown list Guru, ubah dengan figur guru baru yang mendampingi tahun ini.
  3. Simpan. Rapor baru kelak akan mencetak nama wali kelas perampingan ini.

**Informasi Tambahan (QA Validasi)**:
- QA Validasi Integritas: Menghapus sebuah kelas ketika di dalam tabel kelas ini sudah terdaftar riwayat Penugasan atau Ujian berisiko meledakkan error yatim piatu di sisi log jadwal dan rapor. Ubah nama Rombelnya saja, ketimbang di-Delete permanen bila masih dipakai.

### 3.4 Tahun Ajaran (`/academic-years`)
**Deskripsi**: Jantung dari operasional (Heartbeat) sistem sekolah. Seluruh Rapor, Transaksi SPP, Daftar Hadir akan berpijak dan menanyakan Tahun Ajaran Mana yg sedang On?

**Fitur & Cara Penggunaan**:
- **Penjelasan Rotasi Tahun**:
  1. Ketika setahun edukasi berjalan telah tuntas, Staf Tata Usaha wajib menetapkan tahun ajaran (Sem. Ganjil / Genap).
  2. Begitu di-switch, sistem mereset papan absen menjadi bersih karena siklus baru.
  3. Hanya diperkenankan satu batang tahun kalender saja yang bercap (Aktif = TRUE).
- **Cara Pembuatan Tahun Baru**:
  1. Tekan 'Tambah'. Beri format deskriptif (2024/2025).
  2. Tentukan semester Ganjil atau Genap di dropdown.
  3. Simpan.
- **Cara Switch / Setel Mengaktifkan Tahun Berjalan**:
  1. Cari nama Tahun tersebut di daftar Grid UI.
  2. Perhatikan ada baris aksi 'Jadikan Tahun Aktif' / 'Switch'.
  3. Klik. Sistem akan melumpur / menidurkan (Non-aktifkan) tahun kemaren lama Anda, dan menumpuk semua beban logic ke entitas baru ini.

**Informasi Tambahan (QA Validasi)**:
- Konsekuensi Massif Switch: Ketika Anda berpindah Tahun Ajaran dan Semester, rapor guru-guru yang belum di cetak di semestar kemarin tidak akan bisa lagi dibuka oleh akun wali secara visual reguler.

### 3.5 Kategori Keuangan (`/transaction-categories`)
**Deskripsi**: Tempat me-label dompet uang (Kas masuk) dan Beban belanja (Kas Keluar) Yayasan. Disebut juga Buku Besar Akun Kode Perkiraan Keuangan.

**Fitur & Cara Penggunaan**:
- **Pengenalan Jurnal Finansial**:
  1. Setiap Pemasukan (Debit) atau Uang keluar Belanja (Kredit) pastilah takkan bermakna apa-apa jika tak ada pos tag-nya.
  2. Menu ini membantu Bendahara mendaftarkan nama map belanja, misalnya 'Uang Kebersihan', 'Biaya Ekstrakulikuler', 'Honor Tak Terduga'.
- **Cara Membuat Label Kategori Belanja & Pendapatan**:
  1. Klik 'Tambah Kategori'.
  2. Beri identifikasi Nama Kategori (cth: Honor Ekstrakulikuler).
  3. Tetapkan Tipenya (Pilih Pengeluaran untuk hal di atas).
  4. Klik Simpan dan kategori ini auto-tersedia di modul pengisian Jurnal Kas.

**Informasi Tambahan (QA Validasi)**:
- QA Kunci Integritas: Apabila di dalam Jurnal ada transaksi yang sudah dibubuhkan label 'Honor Ekstrakulikuler', maka secara absolut Label tersebut tidak akan dapat Di-Hapus / di-Delete. Bendahara hanya mampu menonaktifkannya saja jika ingin tak ditampilkan di list inputan lain kali.

---

## 4. AKADEMIK

### 4.1 Mata Pelajaran (`/subjects`)
**Deskripsi**: Pengorganisasian database daftar bidang studi kurikulum yang disediakan oleh entitas perguruan.

**Fitur & Cara Penggunaan**:
- **Maksud Penamaan Pelajaran**:
  1. Agar nilai ulangan bisa dientri, sekolah terlebih dulu membikin daftar List-nya disini.
  2. Daftar mata pelajaran biasanya konsisten mulai Mapel Inti (Agama, PKn, Matematika) hingga Mapel Spesifik/Tambahan (Tahfidz, Desain).
  3. Nama mata pelajaran ini mutlak akan tersemat seutuhnya di Lembar Raport anak.
- **Cara Bikin / Tambah Mata Pelajaran**:
  1. Tekan 'Tambah Mapel'.
  2. Isikan Kode referensi internal (Mis: MTK).
  3. Isi baris Nama Pelajaran Resmi yg panjang (Mis: Matematika Lanjut Terpadu).
  4. Tentukan apakah tipe mapel Akademik biasa, atau Muatan Lokal khusus (Khusus sinkronisasi Kurikulum jika ada).
  5. Submit untuk menyimpan.

**Informasi Tambahan (QA Validasi)**:
- QA Validasi Form: Diwajibkan menset Kode unikum. Apabila kode (Pendidikan Jasmani) dengan PJOK sudah teregistrasi, penginputan Kode PJOK oleh guru kedua kalinya tidak bisa masuk server base.

### 4.2 Penugasan Guru (`/teaching-assignments`)
**Deskripsi**: Panel strategis terpenting untuk peramu jadwal. Fitur inilah yang menghubungkan tiga ujung benang: (1) Siapa Gurunya? (2) Mapel Apa yang dibawakan? (3) Kelas Manakah ajarannya bertempat?

**Fitur & Cara Penggunaan**:
- **Konsep Plotting Guru**:
  1. Perihal guru tak bisa menginput ulangan ke rapor Kelas 9 karena beliau tidak terdeteksi sistem, hal ini 100% dipicu admin belum memberi 'Penugasan' pada panel inilah.
  2. Tanpa Relasi di Penugasan Guru, aplikasi menolak mengakui Guru tersebut sebagai pengajar sah di ruangan kelas bersangkutan.
- **Cara Setting Pemberian Tugas**:
  1. Akses 'Tambah Penugasan'.
  2. Cari nama Individu (Cth: Bapak Joko).
  3. Tentukan ruangan lokasinya (Cth: Dropdown Kelas VII A).
  4. Centang atau pilih kotak Pelajaran yg Bapak Joko ajarkan di sana (Bisa lebih dari 1 pelajaran lho, misal: PKn & Sosiologi).
  5. Simpan / Rekam Tugas.
- **Cara Evaluasi & Perombakan Mengajar**:
  1. Jika Bapak Joko cuti melahirkan/izin, cari baris tugasan di Grid ini.
  2. Gunakan aksi Hapus Tugas / Ganti Guru agar hak input rapor berpindah ke Pendidik lain untuk semester depan.

**Informasi Tambahan (QA Validasi)**:
- QA Validasi Logis: Di dalam satu Kelas 7A, pada pelajaran IPA, dilarang (mustahil) mendaulat 2 guru yang sama bertugas mencetak angka rapor IPA secara independen. Sistem akan menolak Duplikasi jika menugaskan orang berbeda menimpa Mapel spesifik ruang yg sama.

### 4.3 Jadwal Pelajaran (`/schedules`)
**Deskripsi**: Jadwal kalender roster mingguan tempat jam mata pelajaran ditempel spesifik pada papan white board Senin s.d Jumat.

**Fitur & Cara Penggunaan**:
- **Penjelasan Roster Terjadwal**:
  1. Sebelum bisa menempatkan nama guru disini, panitia Roster *WAJIB* menyelesaikan hal di menu Penugasan Guru tadi.
  2. Jadwal ini dipakai untuk keperluan print absen, notifikasi ngajar, dll.
- **Cara Peng-input-an Jam Mengajar**:
  1. Filter by Kelas di tabungan UI tabel (misal pilih Kelas 9).
  2. Pilih tombol 'Buat Jam Mengajar'.
  3. Berpindah hari lalu masukan blok waktu (cth: Jam 07:00 s.d 08:30).
  4. Pilih dari selectbox Mapel dan Gurunya.
  5. Sistem menampung dan menampilkan deretan kotak timetable roster.

**Informasi Tambahan (QA Validasi)**:
- QA Kesalahan Bentrok (Collision Detection): Saat Kurikulum tanpa sadar menugaskan Guru BK mengajar pada Senin Jam 08:00 di Rombel 'A' dan rombel 'B' bersamaan letaknya, Mesin kita tidak akan bodoh. Aplikasi langsung Melempar Kesalahan 'Bentrok Jadwal Guru yang Sama!'.

### 4.4 Absensi Siswa (`/attendance`)
**Deskripsi**: Buku kehadiran jurnal list nama murid tiap tanggal. Guru mapel maupun wali kelas bisa absen kelakuan kehadiran dengan sentuhan jari disini.

**Fitur & Cara Penggunaan**:
- **Alur Eksekusi Log Presensi Cepat**:
  1. Idealnya presensi dioperasikan lewat gawai tab/handphone saat guru bersiap tatap muka di kelas.
  2. Pilih rombongan kelas.
  3. Sistem menampilkan set list tabel panjang siswa. Keadaan Defaultnya adalah bercentang 'Hadir' (H) semua dari server.
  4. Guru hanya perlu menekan toogle/radio tombol untuk anak yg tidak datang saja (Bolos (A), Sakit (S), atau Izin (I)).
- **Cara Finalisasi Absen (Kunci Raport harian)**:
  1. Bila sudah beres mencentang siswa bermasalah tsb.
  2. Guru / Tenaga Pengajar WAJIB SCROLL ke area dasar ujung tabel webisite.
  3. Tekan tombol final 'Submit / Rekam Kehadiran ke Sistem'.
  4. Bila berhasil, pita status warna biru notif sukses tampak. Data pun mengalir otomatis disedot masuk ke cetakan Rapor anak akhir semester.

**Informasi Tambahan (QA Validasi)**:
- Autentikasi Hak Guru: Pak Guru A dari luar kelas takkan bisa usil membuka dan mengedit lembaran absensi Kelas B bila ia bukan Wali kelas atau bukan pengajar yang terdaftar ditugaskan kesana.

### 4.5 Manajemen Kurikulum (`/curriculum`)
**Deskripsi**: Settingan pedoman cetak biru pendidikan formal kenegaraan, contoh K13 (Kurikulum 2013), KTSP, atau Kurikulum Merdeka (Kurmer). Dan penentuan Bobot.

**Fitur & Cara Penggunaan**:
- **Esensi Pembobotan**:
  1. Sebuah Nilai ulangan anak tidak dinilai angka mati murni, selalu dikali dengan perbandingan bobot (Contoh presentase 70% Sumatif, 30% Formatif).
  2. Juga menentukan KKM (Kriteria Ketuntasan Minimal). Angka terendah syarat murid Lulus tidak remedial.
- **Cara Kalibrasi Format Kurikulum Nasional**:
  1. Buka pengaturan.
  2. Setel Nama Kurikulumnya.
  3. Isi baris angka batasan KKM Global Sekolah (Misalnya 75 atau 78).
  4. Atur porsi Formatif Vs Akhir Semester. Simpan.

**Informasi Tambahan (QA Validasi)**:
- Sinkronisasi Cetak Raport: Konfigurasi nama kurikulum ini akan dicetak langsung besar besar ke Lembaran Sampul Raport PDF.

### 4.6 Input Nilai Siswa (`/grades`)
**Deskripsi**: Kanvas Penilaian. Tabel cell-sheet bagi guru mata pelajaran guna mengisi skor ujian angka, atau predikat muridnya per kompetensi ulangan harian maupun ulangan semesteran.

**Fitur & Cara Penggunaan**:
- **Alur Input Masif Grid Cerdas**:
  1. Guru (Berdasarkan jadwal yg di-plotting Tata Usaha) masuk ke akun pribadinya, melaju ke fitur ini.
  2. Filter / Pilih Kelas (7B) dan Pilih Pelajaran beliau (Prakarya).
  3. Terbuka sebuah list 30-40 anak memanjang ke bawah layaknya MS. Excel.
  4. Silakan isi manual angkanya '89', '80', '77', dan ketikan catatannya.
- **Cara Eksekusi Penyimpanan Angka Masal**:
  1. Guru yang bijak mengetik 40 anak hingga kelar di akhir barisan.
  2. Penting! Jangan pindah URL (Ganti Tab Halaman) sebelum anda meng-klik tombol SAVE biru di paling mentok laman tabel ke bawah.
  3. Status Tersimpan ditandai adanya pop-up Notif dari sistem pusat.

**Informasi Tambahan (QA Validasi)**:
- QA Auto-Validasi Skala Batas Error: Jika pak guru khilaf kepencet keyboar angka '788' bukannya '78'. Grid cell Nilai menolak keras angka melampauai batas konstan 100 dengan pesan peringatan UI Merah.

### 4.7 Rapor Digital (`/report-cards`)
**Deskripsi**: Pusat Terminal Pelaporan Akhir Semester. Sistem cerdas yang mengintegrasikan AI, Verifikasi Digital QR, dan Snaphot Data untuk menjamin kemudahan Guru dan keamanan data raport siswa.

**Fitur & Cara Penggunaan**:
- **Penjelasan Menu & Alur Kerja (User Flow)**:
  1. Wali Kelas masuk ke menu Rapor Digital untuk asuhan kelasnya.
  2. Sistem otomatis melakukan audit kelengkapan nilai (Cek Kelengkapan) di Step 1.
  3. Jika ada nilai bolong, guru mapel bersangkutan harus mengisi nilai di menu 'Nilai Belajar' terlebih dahulu.
  4. Wali Kelas mengisi Catatan Wali Kelas (Deskripsi Perkembangan) di Step 2.
  5. Finalisasi data, Preview hasil cetak, dan Publikasi Digital di Step 3.
- **Panduan Fitur: AI Note Assistant (Smart Engine)**:
  1. Di Step 2 (Catatan), klik tombol simbol 'Sparkles / AI' pada baris siswa.
  2. Sistem AI akan menganalisis tren nilai akademis dan data kehadiran (Alpha/Izin) siswa.
  3. AI menyarankan narasi profesional (Cth: 'Ananda memiliki fokus luar biasa di eksakta...') yang dapat diedit manual.
  4. Membantu guru menghemat waktu 80% dalam menyusun narasi rapor yang berkualitas.
- **Panduan Fitur: Real-time PDF Preview**:
  1. Di Step 3, klik ikon 'Mata' (Preview) untuk melihat draf PDF asli.
  2. Mencegah kesalahan cetak atau margin yang bergeser sebelum melakukan download massal.
  3. Preview akan menampilkan Watermark 'DRAFT' jika rapor belum dipublikasikan/dikunci.
- **Panduan Fitur: Publikasi & Snapshot Data (Lock System)**:
  1. Klik tombol 'Cloud Upload' untuk mempublikasikan rapor ke Portal Digital Siswa.
  2. Saat di-klik, sistem melakukan 'Snapshot' (Mengunci data saat ini) ke database permanen.
  3. Sekalipun nilai siswa di Menu Master diubah di kemudian hari, nilai di Rapor yang sudah 'PUBLISHED' tetap konsisten/terkunci.
  4. Ini menjamin integritas data historis sekolah (Anti-fraud/Anti-manipulasi).
- **Panduan Fitur: Verifikasi QR Code (Secure Document)**:
  1. Setiap PDF Rapor yang diunduh kini memiliki QR Code unik di footer halaman.
  2. Orang tua atau instansi luar dapat memindai QR tersebut untuk validasi keaslian.
  3. Pindaian akan mengarah ke URL Verifikasi Resmi Velora yang menampilkan data asli dari database pusat.

**Informasi Tambahan (QA Validasi)**:
- Integritas Data: Rapor yang sudah berstatus 'TERKUNCI' tidak bisa diedit datanya tanpa bantuan Super Admin.
- Aesthetics: Template PDF menggunakan font premium dengan pengaturan margin otomatis untuk 10-15 mata pelajaran.
- QA Note: Jika QR Code tidak muncul, pastikan koneksi internet stabil saat proses Generate PDF sedang berlangsung.

### 4.8 Ekstrakurikuler (`/extracurricular`)
**Deskripsi**: Pusat aktivitas di luar jam mengajar. PMR, Paskibraka, Pramuka, KIR, dsb. Sekaligus penempelan skor predikat siswanya.

**Fitur & Cara Penggunaan**:
- **Pendaftaran Basis Murid**:
  1. Akses panel menu Akademik > Ekstra.
  2. Pertama tama, bikin Jenis Ekskulnya dahulu dari tombol panel kanan (Cth: Marching Band).
  3. Masuk Ke sub-katalog 'Daftarkan Anggota Siswa'.
- **Cara Entri Penilaian & Predikat**:
  1. Disusul pilih List nama anak bersangkutan, tempel dirinya pada slot Marching Band.
  2. Setiap persemester diatur predikat kecakapannya. (A - Sangat Aktif, atau B - Rapi).
  3. Catat atau Submit kelar.

**Informasi Tambahan (QA Validasi)**:
- Sinkronisasi Hulu-ke-Hilir: Entri kelakuan si anak di field Marching Band ini dikompresi sedemikian rupa sehingga bila Bapaknya (Wali Kelas) menyedot PDF Raport si anak besoknya, kotak tabel Ekstrakulikuernya otomatis terisi barisan Marching band beserta Predikat 'A Sangat Aktif' tadi, tanpa harus copy paste data apa apa.

### 4.9 Bimbingan Konseling (`/counseling`)
**Deskripsi**: Modul tatib (Tata Tertib) yang mendulang point reward & punishment atas polah tingkah kelakuan santri/siswanya.

**Fitur & Cara Penggunaan**:
- **Perekaman Histori**:
  1. Guru BK (Bimbingan konseling) mendapati anak cabut / lompat pagar.
  2. Buka Akademik > Bimbingan Konseling.
  3. Cari nama anak mabal tersebut.
- **Cara Penilaian Sosiologis (Pemberian Point / Kasus)**:
  1. Klik tambah Tragedi Kasus.
  2. Ketik jenis kasus di form (Lompat dinding), tentukan apakah ini berdampak positif (prestasi) atau negatif (pelanggaran).
  3. Berikan insentif poin (Misal Minus 30 Poin).
  4. Sertakan catatan tambahan.
  5. Submit untuk dicatat di BAP digital anak.

**Informasi Tambahan (QA Validasi)**:
- QA Kalkulasi Kinerja Realtime: Kalau anak A pada selasa cabut (-30) poin, lalu sabtu dia juara futsal (+40 poin). Dashboard BK ketika memvisualkan riwayat anak bersangkutan akan merangkum 'Skor Anak A sekarang adalah = POSITIF +10'. Menghindrai human error salah hitung akumulatif sanksi.

### 4.10 Kalender Akademik (`/calendar`)
**Deskripsi**: Kalender visualisasi event hari raya, tanggal ujian sekolah, hingga pembagian rapot.

**Fitur & Cara Penggunaan**:
- **Visualisasi Alur & Penilaian Mading**:
  1. Semua personil dari ortu hingga guru mendambakan info kapan libur Nasional/Idul Fitri di aplikasi portal sekolahnya.
  2. Modul ini mensimulasikan full-grid Monthly View layaknya Apple Calendar.
- **Cara Input Hari Penting Baru**:
  1. Staff yang berkewajiban meriset Hari Besar mengetuk menu Kalender.
  2. Klik hari (misal 15 Juni). Muncul modal.
  3. Ketik Event Title: 'Peringatan Isra Miraj'.
  4. Tentukan rentang harinya (Mulai 15-selesai 16 Juni).
  5. Pilih Warna Tagging Label merah, lalu simpan.

**Informasi Tambahan (QA Validasi)**:
- Pameran Berantai Ke End User: Siswa juga akan dipertontonkan warna blok kalendarium bulan ini ketika buka portalnya. Admin sekolah bertanggungjawab atas keaktualan data ini agar siswa tak mis-informer ke ortunya.

---

## 5. KEUANGAN

### 5.1 Infaq / SPP (`/infaq-bills`)
**Deskripsi**: Sentra lalu lintas pembayaran konstan murid SPP/Syahriah perbulan. Modul yang didesain agar kasir TU bisa cepat memangkas tagihan SPP bulanan.

**Fitur & Cara Penggunaan**:
- **Siklus Bulanan Keuangan Flow**:
  1. Saat tanggal satu, semua blok nama bulan di deret pembayaran siswa akan beralih merona merah (Belum bayar).
  2. Tata Usaha bisa menelurusi riwayat siapa yang rajin, siapa murid yg telat SPP tahunan dan total nominal hutang.
- **Cara Input Kasir (Ceklist Lunas)**:
  1. Anak datang bawa uang tunai di loby TU.
  2. TU di layar PC Keuangan > Tagihan Infaq, cari nama anak.
  3. Di deret Bar bulan tsb (Agustus), Klik Bayar Agustus.
  4. Sistem menembakkan Popup harga regulasi per bulan SPP.
  5. Masukkan nominal tunai riil anak (Bila ia pas, biarkan 150rb). Set pembayaran via TUNAI.
  6. Sahkan klik simpan Lunas Transaksi.

**Informasi Tambahan (QA Validasi)**:
- QA Relasional Ledger Database Kritis! Sistem menjamin perpaduan integrasi Keuangan Double Entry. Uang tunai murid diatas TAK SAJA meng-hijau-kan tagihannya (Lunas bulan ini dicentong). Namun Mutlak secara di balik layar (Backstage Process) menciptakan sebiji Baris 'Pemasukan Kas Tunai SPP Budi 150rb' meluncur tektok otomatis pada Buku Ledger JURNAL UMUM Utama sekolah tanpa TU capek mengetik laporan lagi dobel pusingnya.

### 5.2 Tabungan Siswa (`/tabungan`)
**Deskripsi**: Sebuah program rekening giro dompet mini milik sekolahan. Bertindak sebagai pemutar celengan siswa yang tiap rehat anak bisa jajan ditarik.

**Fitur & Cara Penggunaan**:
- **Bisnis Flow Penyimpanan Buku Tabungan**:
  1. Kaya program tabungan bank.
  2. Admin akan melihat sisa Saldo bocah tiap harinya.
- **Cara Mencatat Setor Masuk Tabungan**:
  1. Masuk module Keuangan > Tabungan.
  2. Ada 2 kapabilitas 'Tarik' / 'Setor'.
  3. Cari nama anak (Contoh: Rafathar). Klik Setor Rupiah.
  4. Isi barisan teks lembaran tunai yg disetor anak misal ketik: 80,000.
  5. Submisi Simpan Data Ke rekening Database dia.
- **Cara Menarik Penarikan Oleh Anak**:
  1. Sebaliknya Anak mau minta uang keluar.
  2. Tabungan > Tombol Tarik cash. Input 40,000.
  3. Klik Cairkan, maka saldo akun anak ini melemah susut dan uang kas TU dipotong.

**Informasi Tambahan (QA Validasi)**:
- Insufisiensi Keamanan Dana QA Test: Jika anda iseng ngawur mau narik 1 Juta cash padahal celengan anak cuma mentok 2 Ribu Perak. Server AI meng-handle kebodohan ini. Sistem Menolak dengan pesona (Error Validation Insufficient Dana Tabungan) demi menjaga logika balance akunting kas.

### 5.3 Wakaf & Donasi (`/wakaf`)
**Deskripsi**: Pusat penerimaan instrumen pembiayaan sedekah infak temporer, iuran dana bangunan yang di donasikan oleh muhsinin di luar SPP wajib rutin.

**Fitur & Cara Penggunaan**:
- **Arus Perekaman Inflow ZIS**:
  1. Tidak terkait sama perbulan-siswa.
  2. Penyumbang / Donatur lepas menyetor via Panitia Masjid / Sarpras / TU.
  3. Mencatat data riwayatnya dengan detil nama & program agar uangnya nanti dialokasikan secara halal dan wajar.
- **Cara Input Transaksi Pendapatan Hibah Wakaf**:
  1. Keuangan > Wakaf & Donasi.
  2. Klik Tambah Kwitansi Baru / Item Wakaf.
  3. Isikan nama spesifik Hamba Allah / Tuan A.
  4. Deskripsikan peruntukannya (Spesifik renovasi kamar mandi pria Lt 2).
  5. Nominal Donasinya. Simpanlah.

**Informasi Tambahan (QA Validasi)**:
- Pelaporan Laba Transparan: Duit wakaf ini, sesuai syariat dan aturan tata kelola ERP kita, pada saat malam closing pelaporan bulanan oleh kepsek, duit ini mutlak menyemplung tersatukan meramaikan bursa Saldo total Kas Utama yayasan di bagian 'Laporan Rugi/Laba'.

### 5.4 Jurnal Umum (`/journal`)
**Deskripsi**: Kawasan ter sakti bidang keadministrasian Finansial Sekolah. Semacam buku ledger utama yayasan. Entah itu bayar listrik, denda telat angsur, beli spidol, semua berjejak di pualam transaksi row demi row kronologis waktu disini.

**Fitur & Cara Penggunaan**:
- **Logika Penyerap Ledger Arus Uang**:
  1. Seperti disinggung sebelumnya, baris transaksi dari 'Kantin Koperasi', 'Uang SPP', dan 'Donatur' tadi mengakar secara ghaib menjadi Record Baris panjang yang numpuk terkumpul di modul ini setiap letik jari bergetar di menu-menu sebelah.
  2. Jadi fitur utama panel ini adalah untuk Melihat / Review Kas Yayasan secara utuh murni transparan.
- **Cara Input Beban Biaya (Manual Expense) Catat Pengeluaran**:
  1. Lalu jika TU disuruh Bu Kepsek beli Galon Aqua / Listrik. Bayarnya input dimana?
  2. Buka Keuangan > Jurnal Umum.
  3. Bongkar tombol 'Catat Transaksi Manual'.
  4. Pilih arus 'Pengeluaran/Belanja' (Debit ke rekening Kas/Kredit di sistem anda).
  5. Pilih dropdown Kategori Biaya yang diatur di menu awal (Kategori Transaksi). (Cth: Utilitas Internet/Listrik).
  6. Hajar ketik angkanya 500,000, tulis Deskripsi beli tokens. Rekam Data!

**Informasi Tambahan (QA Validasi)**:
- QA Keamanan Derivatif Audit Anti Korupsi: Bendahara mungkin terbayang untuk usil merubah 'Uang SPP Bayaran Si Ucup' dari 100k diubah jadi 0 k untuk dikorupsi diam-diam lewat menu JURNAL UMUM INI. TIDAK BISA. Fitur aplikasi mem-block aksi pengubahan (Hard Edit Record) mutasi yg disuplay oleh komponen otomatis dari modul Infaq atau Koperasi. Pembukuan hanya dapat DIBATALKAN dari modul Asalnya, BUKAN dari Jurnal Umum demi melacak kronologitas Fraud di laporan jejak (Audit log).

### 5.5 Laporan (`/reports`)
**Deskripsi**: Pusat eksport dan rekap neraca. Penghitung kalkulasi laba selisih total pemasukan - pengeluaran lembaga untuk di print dalam Rapat Pimpinan (Rapim).

**Fitur & Cara Penggunaan**:
- **Flow Analisa Keuangan Filter Dinamik**:
  1. Aplikasi memiliki mesin kalkulus untuk mensurvey data periode Custom (Rentang Bebas).
  2. Anda dibebaskan menarik Laporan untuk skala perhari, skala semester ganjil (Juni-Desember), skala tahuan akademik full (Agustus-Juli depan).
- **Cara Mem-build / Generate Report Angka**:
  1. Keuangan > Laporan Arus Kas.
  2. Sebutkan tipe klasifikasi parameter laporanya jika disediakan.
  3. Setting Tanggal Dari Mulai (01 Jan) dan Tanggal Batas Akhir (30 Jan).
  4. Render tekan Apply. Komputer seketika mentabulasi summary angka kas masuk (Income total) direduksi kas keluar (Expense total).
  5. Tembakan data lalu disuntikkan ke plugin Download PDF atau Excel bagi user untuk diprint fisik ke Meja yayasan direksi.

**Informasi Tambahan (QA Validasi)**:
- Bug Validation Tercover QA: Bila user memaksakan mengisi Tgl. Berakhir berada menukik di posisi temporal lebih awal lampau (Backward Time) melangkahi Tgl. Mulai. Program ini akan melempar status BadRequest karena mustahil dan mengembalikan error kalender tidak logis di form filter tanpa mencrash server.

---

## 6. SDM

### 6.1 Data Guru (`/teachers`)
**Deskripsi**: Arsip database profil kepegawaian ekslusif bagi Tenaga Pendidik (Ustadz/Asatidzah/PNS) instansi bersangkutan. Data nama Guru yang lahir disini bakal bersirkulasi di penugasan plotting Rapor kelak.

**Fitur & Cara Penggunaan**:
- **Sistem Data Induk Keprofesian Pegawai**:
  1. Sebelum bikin kelas atau jadwal, menu Guru harus rampung disusun terlebih dulu.
  2. Setiap Individu di dalam sini bakal menjadi entitas utama dalam sub-sistem 'Penilaian & Payroll Gaji'.
- **Cara Perekrutan Profil Baru (Tambah Pegawai Guru)**:
  1. Kepegawaian > Data Master Guru.
  2. Klik tombol Entri Baru profil.
  3. Formulir mengangkangi data Personal (Gelar, Nama Lengkap), Data Instansi (NIP, Tanggal Bergabung, Jabatan Struktural jika ada).
  4. Masukkan parameter krusial untuk Komponen GAJI POKOK dan Tarif HONOR jam ngajar di tab Form khusus gaji.
  5. Simpankan identitasnya kedalam Database Guru aktif institusi.

**Informasi Tambahan (QA Validasi)**:
- QA Keunikan Pegawai Intansi: Serupa halnya NIK & NISN. Nomor Induk Pegawai (NIP/NIK Yayasan) diikat validasi Unik di tataran Server Database ORM (Drizzle). Kalau terjadi double NIP ketik error manusai, server menahan pelampiasan profil simpan ke storage dan menolak form tu.

### 6.2 Data Staf (`/staff`)
**Deskripsi**: Pengarsipan database karyawan bagian backoffice pendukung / suporter diluar korps guru ngajar (Security, Kebersihan, Keuangan, Koperasi).

**Fitur & Cara Penggunaan**:
- **Filosofi Pemisahan Data Jabatan**:
  1. Dibikin terpisah dari Guru agar ketika ada form dropdown penentuan 'Wali Kelas' oleh panitia akademik, nama-nama Satpam Security ini otomatis terlewat / tidak dimuat di list dropdown karena berbeda nature databasenya.
- **Cara Entri Data Staf Baru**:
  1. Mirip dan senada percis irama nya dengan penambahan Guru.
  2. Kepegawaian > Data Master Staf.
  3. Isi Identitas form diri beserta struktur gajinya dan simpan rekapan.

**Informasi Tambahan (QA Validasi)**:
- Batasan Validasi (Segregation of Entity): Akurasi data Staff terjaga dari pusing campur aduk dengan Akademisi. Kepegawaian dipisahkan secara modul fungsional sehingga kalkulasi presensi / absent kerja mereka tetap aman terisolasi pada saat pengupahan Payroll nanti.

### 6.3 Payroll (`/payroll`)
**Deskripsi**: Sistem Komputasi Honorarium Massal. Otomator yang meracik komponen Gaji Pokok, Tunjangan fungsional struktural dilumuri Pemotongan Alpa / Absensi menjadi 1 bundel Slip nominal Gaji.

**Fitur & Cara Penggunaan**:
- **Pola Dasar Komputasional Penggajian Mesin**:
  1. Data Inputnya adalah: Parameter dasar perindividu dari Master Guru, diramu dengan Jumlah hari Bolos di (Modul Absensi).
  2. Ketika tombol kalkulasi ditekan, aplikasi server memforsir perhitungan kompleks ke ratusan nama guru dan satpam serentak demi mempercepat kerja staf keuangan dalam hitung manual yang rewel.
- **Cara Mengeksekusi / Menggenenrate Siklus Payroll Bulanan**:
  1. HR/Keuangan buka Modul > Payroll Gaji.
  2. Pilih rentang batch / Setel Bulannya (Misal Generate Penggajian Akhir September 2025).
  3. Klik Execute Generate Gaji / Hitung.
  4. Mesin berpikir merender, dan sesaat memunculkan deretan Draft nama pegawai disandingkan kolom Angka Kalkulasi siap cair.
- **Cara Finalisasi Verifikasi & Penggembokan Pencairan**:
  1. Klik satu per satu Baris guru tsb buat melihat bedah kompoenen slipnya bila dirasa tak wajar sebelum dicetak.
  2. Bisa juga mengedit paksa manual penambahan insetif (Cth ketik lembur nginep acara 100k di textbox Tambahan) dan klik Update Angka.
  3. Tahap krusial: Tekan 'Approve & Tandai Cair Lunas'.
  4. Slip Gaji otomatis diproteksi Read-Only (Dikunci), lalu saldonya menginfek potong Kas Jurnal Yayasan.

**Informasi Tambahan (QA Validasi)**:
- Stabilitas QA State App: Saat sebuah slip gaji Bapak Ahmad sudah dilabeli bendahara sbagai Status 'Approved Paid/Lunas Pencairan', Segala bentuk fitur 'Ubah' atau 'Delete' baris gaji Pak Ahmad seketika dibuang UI-nya (Frozen Record Safeguard) guna menangkal staff bandel yang mencoba mendistorsi angka uang keluar lapor akuntan.

### 6.4 Inventaris (`/inventory`)
**Deskripsi**: Buku mutasi Logistik. Menampung data aktifa fisik entitas hardware segenap alat peraga sekolahan, proyektor, bangku, ac dlsb. Sampai pada tahapan siklus depresiasi/rusaknya material tadi.

**Fitur & Cara Penggunaan**:
- **Sirkulasi Riwayat Asset Manajemen Flow**:
  1. Barang bertambah ketika yayasan membelinya (Aset In), dan diletakkan dalam ruangan.
  2. Admin inventaris melakukan tag update status kelangsungan usianya di kala barang itu butuh di lem biru, hilang, dicuri. Sehingga Laporan Aset di penghujung laporan tahunan berbunyi rasional.
- **Cara Mengentri Barang Keluar/Masuk Baru**:
  1. Buka Kepegawaian & Logistik > Inventaris Barang.
  2. Pilih Tambah Item Fisik Aset Baru.
  3. Buatkan Identifikasinya (Nama: AC Panasonic Ruang 7A).
  4. Beri Kode Papan Barcode nya kalau ada, tentukan Kondisinya perdana hari ini (Sangat Baik / Berfungsi).
  5. Ketikan QTY, dan harganya, Simpan.
- **Cara Penilaian Siklus Depresiasi/Kerusakan**:
  1. Anggap AC tadi jebol.
  2. Operator Sarpras buka menu Inventaris tadi, sortasi pakai search cari namanya 'AC Panasonic Bawah'.
  3. Klik 'Edit / Pembaruan Status Aset'.
  4. Turunkan grade statusnya dari 'BAIK' menyala menjadi dropdown level 'RUSAK (Diservis/Afkir/Lelang)'.
  5. Berikan narasi log history, dan Submit Perubahan Aset. Sistem mencatat jejak.

**Informasi Tambahan (QA Validasi)**:
- Audit Pencacatan Cermat QA: Mengalihkan parameter kuantitas sebuah Proyektor yang dari 5 (lima) menjadi sisal tinggal 3 di tengah proses pemakaian sistem yang sudah menempuh satu semester penuh adalah wujud dari mis-management kontrol DB Stock. Anda disarankan membikin Jurnal 'Rusak 2' biar sisa live stocknya jadi 3 pcs.

---

## 7. KOPERASI

### 7.1 Produk Koperasi (`/coop/products`)
**Deskripsi**: Buku rak etalase Gudang logistik kulakan stok warung atau kantin operasi unit yayasan yang diperdagangkan ke publik sekolah.

**Fitur & Cara Penggunaan**:
- **Bisnis Retail SKU Produk Inti Stok**:
  1. Ini bukan tempat kulakan jajan untuk donatur, ini buat anak anak / guru berbelanja ecer warung internal berdagang.
  2. Tanpa di-isi etalase produk pada raknya di menu ini, Aplikasi kasir (POS Transaksi) akan memunculkan layar nge-blank/kosong belaka menenggelamkan konter niaga anda.
- **Cara Memasukan Stok Dasar Barang Pemasok Ke Gudang Kita**:
  1. Staff Pengoprasian Unit Niaga membuka Laci Koperasi > Produk Item SKU.
  2. Klik Aksi 'Entri Tambah Barang Ecer Modal Baru'.
  3. Input nama produk spesifik (Mis: Buku Gambar A3 Tebal Sinar Dunia).
  4. Tetapkan Modal dasar HPP per satuan harga beli. (Sebut 3ribu perak).
  5. Tentukan profit taking Margin/Harga Edar Jual buat siswa. (Sebut 6ribu rupiah grosirnya).
  6. Ketik ketersediaan QTY kuantiti stok awal (Misal ada berdus dus kita totlah = 350 piece).
  7. Simpan Database Perdagangan.

**Informasi Tambahan (QA Validasi)**:
- Validasi Alert Rugi Cermin QA: Algoritme proteksi perniagaan disuntikan disni. Dimana jikalau Staff keliru tak waspada mensetel harga Jual-Ke-Anak sebesar 'Rp 10.000', Sementara harga HPP dari Produsen Pabrik Kulakannya pas didata terisi 'Rp 16.000' (Nombok boncoz modal). Komputer akan mencelat menjabarkan warning box merah 'Loss Margin Trade! Angka Harga Ecer Jual terlampau jatuh ketimbang Harga Beli Dasar, perbaiki form anda lantas Save lagi.

### 7.2 Transaksi / Kasir (`/coop/transactions`)
**Deskripsi**: Aplikasi mesin telan kasir ritel gaya minimarket modern. Layar transaksional eksekutor tempat dagang berdenyut yang mereduksi jumlah stok dan menyedot cuan real-time.

**Fitur & Cara Penggunaan**:
- **Alur Transaksi Pertukaran Barang Dengan Uang**:
  1. Konter / Teller duduk manis didepan form grid POS (Point of satış) Keranjang keranjang ini.
  2. Di deret kolom kiri, adalah Katalog List barang yang sudah dimasukkin di menu SKU Tadi.
  3. Ketika klik tombol / kartu barang di sisi Kiri, Keranjang bayar Virtual list sisi Kanan beranak merangkum item.
- **Cara Menjual dan Memfinalisasikan Pemotongan Keranjang Posisi TUNAI**:
  1. Murid (Budi) meletakkan seplastik chiki ke kasir anda.
  2. Kasir meng-klik kotak Chiki 1x. Keranjang sisi kanan menampilkan Struk Chiki x 1 Pcs = 2000 perak.
  3. Kasir menset tombol Metoda Pembayaran Tunai.
  4. Tekan tombol BAYAR SEKARANG atau Checkout Cetak Struk. (Printer mencetak karcis, Laci Uang berbunyi Ting).
  5. Selesai! Sistem detik itu juga mutlak langsung memotong Stok Chiki Induk - 1 Pcs, dan Meraup Jurnal Kasir Pemasukan Uang di Koperasi + 2000 perak.

**Informasi Tambahan (QA Validasi)**:
- QA Sinkronisasi Kuat Cerdas State Management: Baris item Chiki yang kuantitasnya nyosot ke level kritis, atau habis, maka kartu barang belanja di rak Kasir UI POS ini akan terkunci (Disabled Tombol Klik). Mencegah staff memencet benda gaib (Over-Selling kasir fiktif) dan membikin stok gudang Database menjadi Minus yang merupakan haram hukum nya di kancah perakuntansian.

### 7.3 Piutang Siswa (`/coop/credits`)
**Deskripsi**: Buku lecek utang / kas bon santri yang tak membawa duit di warung dan disuruh nyetelin catat tagihan hutang ke depan (ngutang di kantin).

**Fitur & Cara Penggunaan**:
- **Flow Kasbon Lahir Merajut Asalannya**:
  1. Di Transaksi Transaksi diatas, ketika ada Murid bernama Budi jajan Chiki tapi ngutang, Kasir TIDAK MENGEKLIK tombol Tunai, Tapi tombol Tipe Kas KREDIT.
  2. Alhasil, tagihan tersebut tidak mendamparkan laba harian uang masuk kas, tapi masuk ke deretan List panel Piutang ini sebagai Tunggakan.
- **Cara Penagihan Mematikan Baris Piutang Ketika Dilunasi Ortu/Anak**:
  1. Suatu sore, Bapaknya Budi dateng untuk menyetor pelunasan hutang sembako si Chiki Budi.
  2. Pegawai buka Module Koperasi Khusus > 'Daftar Piutang'.
  3. Disana nama BUDI tertulis status Merah 'Tertunggak Kredit 10rb'.
  4. Tekan tombol 'Aksi Lunaskan/Bayar Utang' pada baris milik Budi ini.
  5. Sistem meletuskan modal peringatan Konfirmasi Penulasan kasir.
  6. Simpan. Nama si Budi luntur dari Grid Hutang Piutang tsb, dan uang tunai yg dibayar Bapak si Budi kini terangkum di Pemasukan KOperasi Hari ini secara realita.

**Informasi Tambahan (QA Validasi)**:
- Audit Pencatatan Double Loop QA Validated: Ingat, ketika si Budi Ngutang, walau uang koperasi ga nambah, tapi Benda fisiknya si Chiki udah dikonsumsi anak. Makannya Stok Gudang Chiki tetap di irisis terpotong dikurangi 1 tanpa peduli metode pembayaran Credit / Tunai. Keutuhan Stock Control mutlak dipisahkan dari Flow Financial Credit/Debet di mesin sistem ERP.

---

## 8. TATA USAHA

### 8.1 Absensi Pegawai (`/employee-attendance`)
**Deskripsi**: Jurnal papan tulis virtual tanda kehadiran atau ketidah hadiran, izin staf TU maupun Guru didik ngajar sebagai paramter vital pengurangan potongan gaji bila bermasalah indispliner.

**Fitur & Cara Penggunaan**:
- **Flow Relasional Indispliner Parameter Gaji**:
  1. Setiap hari, TU pencatat atau fingerprint manual harus direkam untuk diunggah catattannya sini.
  2. Daftar Alfa dan Cuti para pendidik dikomputerisasi sebulan penuh, menumpuk dan disaring di siklus hari Payroll Slip gaji tgl 25 / Akhir bulanan tiba.
- **Cara Menandai Alfa Guru & Staf Absen Harian**:
  1. Operator memfokuskan kursor ke layar Administratife > Kepegawaian > List Absen Pegawai.
  2. Disuguhkan barbel tangal kalender absen (Pilih tanggal berapakah sekarang mau absen).
  3. List memanjang seluruh guru-staff tergelar, kondisinya disetel netral hijau (Hadir/Present) serentak oleh program.
  4. Cari nama Guru yg alfa mangkir itu hari. Dan toogle saklar tombol sebelahnya menjadi dropdown 'Sakit / Izin / Alfa (Tanpa Keterangan)'.
  5. Ketik notes medisnya kalau disodor surat.
  6. Lalu bergulir menyebur ke kedalaman page terbawah: 'SIMPAN MASAL ABSEN PEGAWAI HARIAN'.

**Informasi Tambahan (QA Validasi)**:
- QA Mesin Waktu Transaksi Immutable Presensi (Read-Only After Generate): Pada saat slip gaji seorang Guru bernama 'Pak Cecep' TAHUN ITU di BULAN MARET telah dieksekusi Finalisasi pencairanya di menu Payroll oleh bos, maka Absen kehadiran Pak Cecep sejagat rentang Maret Kemaren itu tak dapat lagi dirubah rubah riwayat kehadirannya karena telah disedot dan dipatenkan pada cetak faktur Gaji resminya.

### 8.2 Manajemen Surat (`/letters`)
**Deskripsi**: Buku register agendaris mencakup pendataan nomer antrian surat, resi fisik kedatangan pos kurir (Masuk), dan rekod surat yg menjejaki alamat eksternal (Keluar) pada lemari siber birokrat sekolah.

**Fitur & Cara Penggunaan**:
- **Pemecahan Domain Registrasi**:
  1. Arsip Surat menyurat terpecah dari segi asalnya: Entah Berasal (Masuk) diteken dari luar kantor masuk kedalam, Ataukah diketik dilepas disetujui internal lari meluncur Keluar Pos dinas lainnya.
- **Cara Mengarsipkan Masalah Dokumen Agenda Masuk TU**:
  1. Langkah operatif TU mencatat surat undangan Rapat Dinas Diknas Kabupaten.
  2. TU buka Surat & Administratif > Persuratan. Klik Register Agenda Surat Baru.
  3. Berikan tipe form (Pilih Surat IN/Masuk).
  4. Masukkan No Identifikasi Resi Fisik Dokumen / Kop Nomor berkas dari pengirim sana di isian Form.
  5. Sebutkan tanggal titimangda (Hari Pengiriman dari cap surat fisik tsb).
  6. Input Perihal tujuan: (Sebutkan rapat pembahasan UN). Uraikan Isi Ringkas di Text Box besar bawahnya.
  7. Terakhir dan Paling Penting! Arahkan ke Form Lampiran PDF, File Explorer tergelar, silakan pilih hasil fotokopian Scan Softcopy Scan Printer Anda tersebut (PDF doc), dan Upload Simpan.

**Informasi Tambahan (QA Validasi)**:
- Validasi Pertahanan File Payload QA Limit: File extension upload filter dipasang ganda oleh MiddleWare API NextJS. Memasrahkan script .exe, .sh, .bat atau file raksasa over 5MB kepada server agenda surat tidak akan dimengerti oleh form. Sistem melontarkan amunisi 422 Invalid Media / Format Size Too Big Overload Error membebaskan keamanan bucket simpanan dokumen Cloud aplikasi.

### 8.3 Pengumuman (`/announcements`)
**Deskripsi**: Selembar mading broadcast Toa informasi yang melecutkan notifikasi siaran (Pop Up atau Papan banner) menyala pada layar di seluruh dashboard pangkalan akun login stakeholder murid, wali, atau para gurunya.

**Fitur & Cara Penggunaan**:
- **Sifat Targeting Audiens Logikanya Bebas Berjejaring Selektywnya**:
  1. Pengumuman Tak Perlu Diteriakkan keseluruh lorong internet pangkalan jika hanya dibutuhkan spesifik. Contoh Pengumuman 'Harap kumpul soal RPP' kan CUMA diperuntukkan User GURU BUKAN ANAK MURID.
  2. Karenanya, Pengumuman Punya fitur 'Target Bidikan Level'.
- **Cara Menyiarkan Broadcast Terfokus**:
  1. Buka Panel Informasi > Modul Rilis Pengumuman.
  2. Tekan Buat Entri Siaran Baru.
  3. Ketik subjek Judul Pengerah Perhatian (Contoh 'Libur Darurat Musim Banjir Besok').
  4. Tulisan narasinya diluaskan di textbox besar penggabung bawah.
  5. Pilih Dropdown Check mark Target Groupnya: Pilihan Centang (GURU), Centang (MURID), Centang (STAF). Biarkan Kosong Murid kalo ini spesifik Staf/Guru doang.
  6. Tetapkan Tanggal Publish Live / Mulai Siaran dan Kapan tanggal Berdengungnya Berakhir / Kering Kadaluarsa dihilangkan robot sistem nantinya.
  7. Tindis tombol Publish Pengumuman. Bertebaranlah sudah pop up kabar baru.

**Informasi Tambahan (QA Validasi)**:
- Targeting Isolation QA Firewall Check: Apabila Staf Mempublikasikan berita internal Honorarium Bonus yang tercentang hanya untuk GURU dan STAFF saja. Apabila ada seorang User Anak bernama Anton Log-in melalui HP / Desktop, sistem Dashboard Anton sama sekali tak dapat mendeteksi, melihat, merasai, apalagi menemukan URL API Get id Announcement artikel tsb (Segregated Authentication Wall).

### 8.4 Profil Sekolah (`/school-profile`)
**Deskripsi**: Ini bukan semacam Biodata User, ini form inti global pilar pondasi nama lembaga pendidikan, alamat geologis kenegaraan sekolah dan gambar Logo instansi kop yayasan utama kita didalam semesta ERP aplikasi.

**Fitur & Cara Penggunaan**:
- **Arus Sentral Variabel Instansional Dinamik**:
  1. Tulisan text yang mengendap pada form data sekolah ini (seperti SDN 99 Cikarang) akan senantiasa di ekstrak (Sedot Variable Parsing Render) pada ratusan lembar nota, kwitansi koperasi, lapor PDF Arus Kas, apalagi Kop Raport E-Rapor Digital yang dicetak semua guru tiap semesternya.
- **Cara Menetapkan Atribut Logo & Identitas Lembaga Induk Server Utama**:
  1. Admin (Hanya Hak Akses Root yg diperkenankan) menyelinap masuk ke Panel Konfigurasi Global > Profil Instansi Sekolah
  2. Input nama lembaga formal nan sah di kotak 'Nama Sekolah'. Input nomer statistik sekolahan NPSN dlsb.
  3. Untuk Pasang Logo Sekolah, Drop atau unggah berkas Gambar icon (.PNG, transparan minimal).
  4. Ketik deskripsi alamat instansi yang jelas demi akurasi Header Template Struk Struk pembayaran kasir.
  5. Setel identitas Kepala Sekolah per tahun menjabat.
  6. Tekan tombol Menyimpan Perubahan Sistem (Save Setting).

**Informasi Tambahan (QA Validasi)**:
- Cache Propagation Behavior Validation & State Rapor Engine: Saat anda mengubah Logo Instansi di pengaturan pagi ini, maka Ratusan Rapor Guru yg mendadak mendownload dan merender file PDF siang itu Langsung Berubah Seketika logonya termutasi merujuk pada Gambar Baru anda yang di save td tanpa butuh reset server backend / nunggu besok lagi (Seamless state). Terkecuali, wali kelas sudah mendiktekan di Panel Khusus KOP RAPORT spesifik mereka file gambar upload baru di menu Rapor, disitulah sistem Logo Sekolah akan Terkalahkan prioritasnya ter-override mendahulukan KOP Khusus Rapor dibanding Kop Sekolah ini.

---

## 9. SISTEM

### 9.1 Pengaturan (`/settings`)
**Deskripsi**: Ruang gawat darurat dan saklar otoritas paling menohok di kendalikan penuh pengembang / administrator sistem. Kontrol akses Role, resetan masif kredensial sandi pegawai, cadangan Backup file master seluruh skema database ERP semua tumpah ruah terkelola dipanel jantung server ini.

**Fitur & Cara Penggunaan**:
- **Batas Demarkasi Red-Line Server Perilaku Peringatan Kritis**:
  1. Apapun yg Anda sikut / centang / ubah / reset / hapus format parameter dari konfigurasi tab tab tab yang bermunculan di page /settings ini dapat menelurkan efek tewas (fatal data loss) berjenjang jika diklik sembarangan tanpa literasi pengetahuan yg diampu seorang Admin TI.
- **Cara Megontrol User Akun Kredensial & Mereset Paksa Sandi Pihak Pengguna**:
  1. Sekiranya Ibu Dian (Wali 7A) kelalaian lupa kata sandi miliknya padahal sore mesti setor raport. Ibu Dian Lapor Admin TI.
  2. Admin merayap masuk ke panel Pengaturan (Settings) > Pilih Subtab Manage Otoritas Users.
  3. Cari di field data search 'Nama: Dian / Role: Guru'.
  4. Tekan Opsi Titik Tiga (Aksi), dan pilih Ganti/Paksa Reset Kata Sandi. (Setel ulang password baru seperti: dian123Aman).
  5. Bisa juga mengunci / Mematikan pernafasana User tsb Banned status agar disable tidak dibolehin Akses login bila Guru itu terbukti dipecat.
- **Cara Menarik Master Backup Cadangan Keamanan Data Internal**:
  1. Sebagai tindakan preventif musibah. Admin menyusuri tab 'Master Utilities DB Backup'.
  2. Tekan Download Ekstraks Database SQL File.
  3. Sistem me re-kompres ribuan data mulai Pendaftaran, List Murid Mutasi dan Transaksi Kas Uang Jurnal jadi bongkahan File aman yang bisa disimpan ke Hard Drive Flashdisk Eksternal Fisik anda dilaci laci kamar aman anda.

**Informasi Tambahan (QA Validasi)**:
- QA Keamanan Otentifikasi Tingkat Dewa dan Akses Bypass Testing Terisolir Mutlak (Role Privilege Intrusion Exploit Rejection): Andaikankah Staf TU 'Pintar' yg mempunyai akses ringan biasa secara iseng isengan iseng Mengetik nama link URL paksaan di Address Bar Komputernya nulis rute tujuan URL domainnya : www.webssekolahanda.com/settings lantas mendobrak enter!, Middleware Aplikasi Server kita secara kokoh menolak paksaan peretas tersebut mementalkanya jauh jauh membikinnya Terlempar redirect ke halaman 403 Access Denied Tidak Ada Akses Otorisasi! Karena levelnya bukan si SUPER Admin Root Developer. Fitur yang paling terkontrol seumur instansi terjamin kerahasiaanya.
