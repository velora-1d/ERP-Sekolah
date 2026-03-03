"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function StudentsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students");
      const json = await res.json();
      if (json.success) setData(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredData = data.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.nisn || "").includes(q)
    );
  });

  const handleDelete = (s: any) => {
    Swal.fire({
      title: "Hapus Siswa?",
      text: `Semua data terkait "${s.name}" akan ikut terhapus.`,
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
        } catch (error) {
          Swal.fire("Error", "Gagal menghubungi server", "error");
        }
      }
    });
  };

  const catColors: Record<string, string[]> = {
    reguler: ["#f1f5f9", "#475569"],
    yatim: ["#fef3c7", "#92400e"],
    kurang_mampu: ["#ede9fe", "#6b21a8"],
  };

  const statusColors: Record<string, string[]> = {
    aktif: ["#d1fae5", "#047857"],
    lulus: ["#cffafe", "#0e7490"],
    pindah: ["#ffedd5", "#c2410c"],
    nonaktif: ["#e5e7eb", "#6b7280"],
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Manajemen Siswa</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola data siswa, kategorisasi biaya & penempatan kelas.</p>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <input type="text" placeholder="Cari nama/NISN..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "0.625rem", fontSize: "0.8125rem", width: 180, outline: "none" }} className="placeholder-white/60 focus:bg-white/30 transition-colors" />
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.25)", cursor: "pointer" }} className="hover:bg-white/30 transition-colors">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export
              </button>
              <Link href="/students/new" style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer" }} className="hover:bg-white/35 transition-all">
                <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Siswa */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "50%" }}></div>
          <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Siswa</h4>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Siswa</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Kategorisasi</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Kelas</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>
                  <svg className="animate-spin" style={{ width: 24, height: 24, margin: "0 auto 8px", display: "block" }} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Memuat data...
                </td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#8b5cf6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Data Siswa</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>Klik tombol "Tambah" untuk menambahkan data siswa.</p>
                  </div>
                </td></tr>
              ) : (
                filteredData.map((s, i) => {
                  const initial = (s.name || "?").charAt(0).toUpperCase();
                  const genderLabel = s.gender === "L" ? "♂ Laki-laki" : "♀ Perempuan";
                  const cc = catColors[s.category] || catColors.reguler;
                  const sc = statusColors[s.status] || statusColors.nonaktif;
                  const catLabel = (s.category || "reguler").replace("_", " ").replace(/\b\w/g, (l:string) => l.toUpperCase());

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600, verticalAlign: "middle" }}>{i + 1}</td>
                      <td style={{ padding: "1rem 1.5rem", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#ede9fe,#e0e7ff)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#6366f1" }}>{initial}</div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{s.name || "-"}</p>
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>NISN: {s.nisn || "-"} · {genderLabel}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, borderRadius: 999, background: cc[0], color: cc[1] }}>{catLabel}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        {s.classroom ? (
                          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{s.classroom}</span>
                        ) : (
                          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", padding: "0.25rem 0.625rem", borderRadius: 999 }}>Tanpa Kelas</span>
                        )}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, borderRadius: 999, textTransform: "capitalize", background: sc[0], color: sc[1] }}>{s.status || "-"}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <Link href={`/students/${s.id}/edit`} style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }} className="hover:bg-indigo-100 transition-colors">Edit</Link>
                          <button onClick={() => handleDelete(s)} style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }} className="hover:bg-red-100 transition-colors">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
