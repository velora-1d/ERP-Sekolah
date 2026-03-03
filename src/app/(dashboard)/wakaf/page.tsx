"use client";
import { useState, useEffect } from "react";

export default function WakafPage() {
  const [data, setData] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ total: 0, monthly: 0, donorCount: 0, purposeCount: 0 });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/wakaf`);
      const json = await res.json();
      if (json.success) {
        setData(json.transactions || []);
        setKpi(json.kpi || { total: 0, monthly: 0, donorCount: 0, purposeCount: 0 });
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

  function fmtRp(n: number) {
    return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Wakaf & Donasi</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola penerimaan wakaf dari para muwakif.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer" }} className="hover:bg-white/30 transition-colors">
                <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Donatur
              </button>
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.5rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.4)", cursor: "pointer" }} className="hover:bg-white/30 transition-colors">
                <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Terima Wakaf
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Wakaf</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#059669", marginTop: "0.25rem" }}>{fmtRp(kpi.total)}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Bulan Ini</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#0ea5e9", marginTop: "0.25rem" }}>{fmtRp(kpi.monthly)}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Donatur</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#6366f1", marginTop: "0.25rem" }}>{kpi.donorCount}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tujuan Wakaf</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#d97706", marginTop: "0.25rem" }}>{kpi.purposeCount}</p>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#059669,#10b981)", borderRadius: "50%" }}></div>
          <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Riwayat Penerimaan Wakaf</h4>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Tanggal</th>
                <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Donatur</th>
                <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Tujuan</th>
                <th style={{ padding: "0.75rem 1.5rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nominal</th>
                <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#d1fae5,#a7f3d0)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b" }}>Belum Ada Transaksi</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.25rem" }}>Catat penerimaan wakaf pertama.</p>
                  </div>
                </td></tr>
              ) : (
                data.map((t: any, i) => {
                  const statusBadge = t.status === "void"
                    ? <span style={{ padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6b7280", background: "#e5e7eb", borderRadius: 999 }}>Void</span>
                    : <span style={{ padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}>✓ Valid</span>;
                  const date = t.date ? new Date(t.date).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' }) : "-";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9", opacity: t.status === "void" ? 0.45 : 1 }}>
                      <td style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "0.75rem 1.5rem", fontSize: "0.8125rem", color: "#475569" }}>{date}</td>
                      <td style={{ padding: "0.75rem 1.5rem", fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b" }}>{t.donor_name}</td>
                      <td style={{ padding: "0.75rem 1.5rem", fontSize: "0.8125rem", color: "#475569" }}>{t.purpose_name}</td>
                      <td style={{ padding: "0.75rem 1.5rem", textAlign: "right", fontWeight: 700, fontSize: "0.8125rem", color: "#059669" }}>{fmtRp(t.amount)}</td>
                      <td style={{ padding: "0.75rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                      <td style={{ padding: "0.75rem 1.5rem", textAlign: "center" }}>
                        {t.status !== "void" ? (
                          <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Hapus</button>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
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
