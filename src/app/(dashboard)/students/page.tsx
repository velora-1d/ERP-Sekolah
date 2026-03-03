"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import Pagination from "@/components/Pagination";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const DownloadIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ExportIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;
const StudentsIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

export default function StudentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 20 });

  const loadStudents = useCallback(async (p = page, q = search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/students?page=${p}&limit=20&q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data || []);
        if (json.pagination) setPagination(json.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { loadStudents(); }, []);

  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearch(q);
    setPage(1);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadStudents(1, q), 400);
  }

  function handlePageChange(p: number) {
    setPage(p);
    loadStudents(p, search);
  }

  const handleDelete = (s: any) => {
    Swal.fire({
      title: "Hapus Siswa?",
      text: `Semua data terkait "${s.name}" akan ikut dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/students/${s.id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            Swal.fire("Terhapus", "Data siswa berhasil dihapus.", "success");
            loadStudents();
          } else {
            Swal.fire("Gagal", json.message || "Error", "error");
          }
        } catch {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const catBadge: Record<string, "neutral" | "warning" | "info"> = {
    reguler: "neutral",
    yatim: "warning",
    kurang_mampu: "info",
  };

  const statusBadge: Record<string, "success" | "info" | "warning" | "danger" | "neutral"> = {
    aktif: "success",
    lulus: "info",
    pindah: "warning",
    nonaktif: "neutral",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header — pakai PageHeader reusable */}
      <PageHeader
        title="Manajemen Siswa"
        subtitle="Kelola data siswa, kategorisasi biaya & penempatan kelas."
        icon={<StudentsIcon />}
        gradient="from-indigo-600 via-violet-600 to-purple-600"
        actions={
          <>
            <input
              type="text"
              placeholder="Cari nama/NISN..."
              value={search}
              onChange={handleSearch}
              className="px-3 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-sm outline-none placeholder-white/60 focus:bg-white/30 transition-colors w-44"
            />
            <Button variant="ghost" size="sm" icon={<DownloadIcon />} onClick={() => window.location.href = "/api/students/template"} className="!text-white !bg-white/10 border border-white/20 hover:!bg-white/25">
              Template
            </Button>
            <label className="cursor-pointer">
              <Button variant="ghost" size="sm" icon={<UploadIcon />} className="!text-white !bg-white/10 border border-white/20 hover:!bg-white/25 pointer-events-none" as-child="true">
                Import
              </Button>
              <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("file", file);
                try {
                  const res = await fetch("/api/students/import", { method: "POST", body: fd });
                  const json = await res.json();
                  Swal.fire(json.success ? "Berhasil" : "Gagal", json.message, json.success ? "success" : "error");
                  if (json.success) loadStudents();
                } catch { Swal.fire("Error", "Gagal import", "error"); }
                e.target.value = "";
              }} />
            </label>
            <Button variant="ghost" size="sm" icon={<ExportIcon />} onClick={() => window.location.href = "/api/students/export"} className="!text-white !bg-white/15 border border-white/25 hover:!bg-white/30">
              Export
            </Button>
            <Link href="/students/new">
              <Button variant="ghost" size="sm" icon={<PlusIcon />} className="!text-white !bg-white/20 border border-white/30 hover:!bg-white/35 !font-bold !uppercase !tracking-wider">
                Tambah
              </Button>
            </Link>
          </>
        }
      />

      {/* Tabel Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" />
          <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Siswa</h4>
          <Badge variant="info" className="ml-2">{pagination.total} siswa</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["No", "Siswa", "Kategorisasi", "Kelas", "Status", "Aksi"].map((h, i) => (
                  <th key={h} className={`px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i >= 3 ? "text-center" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <p className="text-sm text-slate-400 font-medium">Memuat data...</p>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-100 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p className="font-heading font-bold text-slate-700">Belum Ada Data Siswa</p>
                    <p className="text-sm text-slate-400 mt-1">Klik tombol "Tambah" untuk menambahkan data siswa.</p>
                  </div>
                </td></tr>
              ) : (
                data.map((s, i) => {
                  const idx = ((pagination.page - 1) * pagination.limit) + i + 1;
                  const initial = (s.name || "?").charAt(0).toUpperCase();
                  const genderLabel = s.gender === "L" ? "♂ Laki-laki" : "♀ Perempuan";
                  const catVar = catBadge[s.category] || "neutral";
                  const statVar = statusBadge[s.status] || "neutral";
                  const catLabel = (s.category || "reguler").replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase());

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="px-5 py-4 text-center text-sm text-slate-400 font-semibold">{idx}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center font-bold text-sm text-indigo-600 shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-800">{s.name || "-"}</p>
                            <p className="text-xs text-slate-400 mt-0.5">NISN: {s.nisn || "-"} · {genderLabel}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={catVar}>{catLabel}</Badge>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {(s.classroom && s.classroom.name) ? (
                          <Badge variant="info">{s.classroom.name}</Badge>
                        ) : (
                          <Badge variant="danger">Tanpa Kelas</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Badge variant={statVar} dot>{s.status || "-"}</Badge>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Link href={`/students/${s.id}/edit`}>
                            <Button variant="outline" size="sm">Edit</Button>
                          </Link>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(s)}>Hapus</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}
