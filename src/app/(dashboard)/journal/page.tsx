"use client";
import { useState, useEffect } from "react";

export default function JournalPage() {
  const [data, setData] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  async function loadData(filter = typeFilter) {
    setLoading(true);
    try {
      const res = await fetch(`/api/journal?type=${filter}`);
      const json = await res.json();
      if (json.success) {
        setData(json.entries || []);
        setKpi(json.kpi || { totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTypeFilter(e.target.value);
    loadData(e.target.value);
  }

  function fmtRp(n: number) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#312e81 50%,#4f46e5 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2.5rem 2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: 0 }}>Kas & Jurnal Umum</h2>
              </div>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", maxWidth: 500, lineHeight: 1.5 }}>Kelola arus kas masuk (BOS, Bantuan) dan keluar (Operasional, Gaji) sekolah secara terpusat.</p>
            </div>
            <div className="flex gap-3">
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "#fff", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }} className="hover:bg-white/30 transition-colors">
                <svg style={{ width: "0.9rem", height: "0.9rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export Excel
              </button>
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "#fff", color: "#312e81", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 700, border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", cursor: "pointer" }} className="hover:bg-slate-50 transition-colors">
                <svg style={{ width: "1.25rem", height: "1.25rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Catat Jurnal Baru
              </button>
            </div>
          </div>

          {/* KPI Cards dalam Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginTop: "2rem" }}>
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", padding: "1.25rem", borderRadius: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Total Saldo Semua Kas</p>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>{fmtRp(kpi.totalBalance)}</h3>
            </div>
            <div style={{ background: "rgba(16,185,129,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(16,185,129,0.3)", padding: "1.25rem", borderRadius: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#a7f3d0", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Pemasukan (Bulan Ini)</p>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>{fmtRp(kpi.thisMonthIn)}</h3>
            </div>
            <div style={{ background: "rgba(225,29,72,0.15)", backdropFilter: "blur(12px)", border: "1px solid rgba(225,29,72,0.3)", padding: "1.25rem", borderRadius: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fecdd3", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>Pengeluaran (Bulan Ini)</p>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", margin: 0 }}>{fmtRp(kpi.thisMonthOut)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Tabel Jurnal */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#0f172a", margin: 0 }}>Riwayat Jurnal Kas</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select value={typeFilter} onChange={handleFilterChange} style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", color: "#475569", background: "#fff", outline: "none" }}>
              <option value="">Semua Tipe</option>
              <option value="in">Pemasukan (In)</option>
              <option value="out">Pengeluaran (Out)</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", width: 50, textAlign: "center" }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", width: 120 }}>Tgl</th>
                <th style={{ padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Keterangan & Kategori</th>
                <th style={{ padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Penerimaan</th>
                <th style={{ padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Pengeluaran</th>
                <th style={{ padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", width: 60 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500, margin: 0 }}>Memuat...</p>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 48, height: 48, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg style={{ width: 24, height: 24, color: "#cbd5e1" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500, margin: 0 }}>Belum ada riwayat jurnal kas.</p>
                  </div>
                </td></tr>
              ) : (
                data.map((e: any, i) => {
                  const date = e.date ? new Date(e.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }) : "-";
                  const isIn = e.type === "in";

                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9", opacity: e.status === "void" ? 0.4 : 1 }}>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#475569" }}>{date}</td>
                      <td style={{ padding: "0.875rem 1.5rem" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>
                          {e.description || "-"}
                          {e.status === "void" && <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, marginLeft: 6 }}>[VOID]</span>}
                        </p>
                        <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>{e.category_name}</span>
                      </td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontWeight: 700, color: isIn ? "#059669" : "#cbd5e1", fontSize: "0.8125rem" }}>
                        {isIn ? fmtRp(e.amount) : "-"}
                      </td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontWeight: 700, color: !isIn ? "#e11d48" : "#cbd5e1", fontSize: "0.8125rem" }}>
                        {!isIn ? fmtRp(e.amount) : "-"}
                      </td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "right" }}>
                        <button style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "0.375rem", cursor: "pointer" }} title="Hapus" className="hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                          <svg style={{ width: "0.875rem", height: "0.875rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
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
