"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function TeachersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teachers");
      const json = await res.json();
      if (json.success) setData(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const filteredData = data.filter((t) => {
    const matchSearch =
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.nip || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.position || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    Swal.fire({
      title: "Tambah Guru",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <label style="font-size:0.75rem;font-weight:600;color:#475569;">Nama</label>
          <input id="swal-tch-name" class="swal2-input" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;color:#475569;">NIP/NUPTK</label>
          <input id="swal-tch-nip" class="swal2-input" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;color:#475569;">Posisi/Jabatan</label>
          <input id="swal-tch-pos" class="swal2-input" placeholder="Guru Kelas" style="margin:0;">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      preConfirm: () => {
        return {
          name: (document.getElementById("swal-tch-name") as HTMLInputElement).value,
          nip: (document.getElementById("swal-tch-nip") as HTMLInputElement).value,
          position: (document.getElementById("swal-tch-pos") as HTMLInputElement).value,
          type: "guru",
          status: "aktif",
        };
      },
    }).then((r) => {
      if (r.isConfirmed) {
        Swal.fire("Berhasil", "Data guru ditambahkan. (Visual Only)", "success");
      }
    });
  };

  const handleEdit = (t: any) => {
    Swal.fire({
      title: "Edit Data Guru",
      html: `
        <div style="text-align:left;display:grid;gap:0.75rem;">
          <label style="font-size:0.75rem;font-weight:600;color:#475569;">Nama</label>
          <input id="swal-tch-name" class="swal2-input" value="${t.name || ""}" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;color:#475569;">NIP/NUPTK</label>
          <input id="swal-tch-nip" class="swal2-input" value="${t.nip || ""}" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;color:#475569;">Posisi/Jabatan</label>
          <input id="swal-tch-pos" class="swal2-input" value="${t.position || ""}" style="margin:0;">
          <label style="font-size:0.75rem;font-weight:600;color:#475569;">Status</label>
          <select id="swal-tch-stat" class="swal2-select" style="margin:0;">
            <option value="aktif" ${t.status === "aktif" ? "selected" : ""}>Aktif</option>
            <option value="nonaktif" ${t.status === "nonaktif" ? "selected" : ""}>Non-Aktif</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      preConfirm: () => {
        return {
          name: (document.getElementById("swal-tch-name") as HTMLInputElement).value,
          nip: (document.getElementById("swal-tch-nip") as HTMLInputElement).value,
          position: (document.getElementById("swal-tch-pos") as HTMLInputElement).value,
          status: (document.getElementById("swal-tch-stat") as HTMLSelectElement).value,
        };
      },
    }).then((r) => {
      if (r.isConfirmed) {
        Swal.fire("Berhasil", "Data guru diperbarui. (Visual Only)", "success");
      }
    });
  };

  const handleDelete = (t: any) => {
    Swal.fire({
      title: "Hapus Data Guru?",
      html: `<p style="font-size:0.875rem;color:#475569;">Data <strong>"${t.name}"</strong> akan dihapus.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then((r) => {
      if (r.isConfirmed) {
        Swal.fire("Berhasil", "Data guru dihapus. (Visual Only)", "success");
      }
    });
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
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Data Guru & Tenaga Pendidik</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola direktori tenaga pengajar secara terpusat.</p>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <button onClick={() => window.location.href = "/api/teachers/template"} style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer" }} className="hover:bg-white/25 transition-colors">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Template
              </button>
              <label style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer" }} className="hover:bg-white/25 transition-colors">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Import
                <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("file", file);
                  try {
                    const res = await fetch("/api/teachers/import", { method: "POST", body: fd });
                    const json = await res.json();
                    Swal.fire(json.success ? "Berhasil" : "Gagal", json.message, json.success ? "success" : "error");
                    if (json.success) loadTeachers();
                  } catch { Swal.fire("Error", "Gagal import", "error"); }
                  e.target.value = "";
                }} />
              </label>
              <button onClick={() => window.location.href = "/api/teachers/export"} style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.25)", cursor: "pointer" }} className="hover:bg-white/30 transition-colors">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export
              </button>
              <button onClick={handleAdd} style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer" }} className="hover:bg-white/30 transition-colors">
                <svg style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Tambah Data Guru
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Tabel */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "50%" }}></div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Guru</h4>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, nip, posisi..." style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", border: "1px solid #e2e8f0", borderRadius: "0.625rem", width: 220, outline: "none" }} className="focus:border-indigo-500" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "0.5rem 2rem 0.5rem 1rem", fontSize: "0.8125rem", border: "1px solid #e2e8f0", borderRadius: "0.625rem", outline: "none", background: "#f8fafc", cursor: "pointer" }}>
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Profil Guru</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Tugas Pokok & Fungsi</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#eef2ff,#c7d2fe)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#4f46e5" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Memuat data...</p>
                  </div>
                </td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#eef2ff,#c7d2fe)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#4f46e5" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Data Guru</p>
                  </div>
                </td></tr>
              ) : (
                filteredData.map((t, i) => {
                  const initial = (t.name || "?").charAt(0).toUpperCase();
                  const statusBadge = t.status === "aktif"
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }}></div>Aktif</span>
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", borderRadius: 999 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8" }}></div>Non-Aktif</span>;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#eef2ff,#c7d2fe)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#4f46e5" }}>{initial}</div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{t.name}</p>
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>NIP/NUPTK: {t.nip || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{t.position || "-"}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.375rem" }}>
                          <button onClick={() => handleEdit(t)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer" }} title="Edit" className="hover:bg-slate-100"><svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                          <button onClick={() => handleDelete(t)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer" }} title="Hapus" className="hover:bg-red-50 hover:text-red-500"><svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
