"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function StaffPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff");
      const json = await res.json();
      if (json.success) setData(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filteredData = data.filter((s) => {
    const matchSearch =
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.nip || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.position || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? s.status === statusFilter : true;
    return matchSearch && matchStatus;
  });



  const handleEdit = (s: any) => {
    router.push(`/staff/${s.id}/edit`);
  };

  const handleDelete = (s: any) => {
    Swal.fire({
      title: "Hapus Data Staf?",
      html: `<p style="font-size:0.875rem;color:#475569;">Data <strong>"${s.name}"</strong> akan dihapus.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/staff/${s.id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) { Swal.fire("Terhapus", json.message, "success"); loadStaff(); }
          else Swal.fire("Gagal", json.message, "error");
        } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#3b82f6 50%,#6366f1 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Data Staf & Karyawan</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola direktori staf tata usaha dan karyawan secara terpusat.</p>
              </div>
            </div>
            <Link href="/staff/new" style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "none" }} className="hover:bg-white/30 transition-colors">
              <svg style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Tambah Data Staf
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Tabel */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#0ea5e9,#6366f1)", borderRadius: "50%" }}></div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Staf</h4>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, nik, jabatan..." style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", border: "1px solid #e2e8f0", borderRadius: "0.625rem", width: 220, outline: "none" }} className="focus:border-blue-500" />
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
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Profil Staf</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Posisi / Jabatan</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Memuat data...</p>
                  </div>
                </td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#0284c7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Data Staf</p>
                  </div>
                </td></tr>
              ) : (
                filteredData.map((s, i) => {
                  const initial = (s.name || "?").charAt(0).toUpperCase();
                  const statusBadge = s.status === "aktif"
                    ? <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }}></div>Aktif</span>
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", borderRadius: 999 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#94a3b8" }}></div>Non-Aktif</span>;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#e0f2fe,#bae6fd)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#0284c7" }}>{initial}</div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{s.name}</p>
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>NIK/ID: {s.nip || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#0284c7", background: "#f0f9ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{s.position || "-"}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.375rem" }}>
                          <button onClick={() => handleEdit(s)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#eef2ff", color: "#6366f1", border: "1px solid #c7d2fe", borderRadius: "0.375rem", cursor: "pointer" }} title="Edit" className="hover:bg-indigo-100"><svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                          <button onClick={() => handleDelete(s)} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer" }} title="Hapus" className="hover:bg-red-50 hover:text-red-500 hover:border-red-200"><svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
