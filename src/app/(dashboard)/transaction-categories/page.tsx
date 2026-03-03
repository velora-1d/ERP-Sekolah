"use client";
import { useState, useEffect } from "react";

export default function TransactionCategoriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction-categories`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const inCats = data.filter((c: any) => c.type === 'in');
  const outCats = data.filter((c: any) => c.type === 'out');

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#7c3aed 0%,#8b5cf6 50%,#a78bfa 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Kategori Keuangan</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola kategori pemasukan & pengeluaran madrasah.</p>
              </div>
            </div>
            <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s ease" }} className="hover:bg-white/30">
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabel Pemasukan */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "#059669", borderRadius: "50%" }}></div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Pemasukan</h4>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#059669", background: "#d1fae5", padding: "0.125rem 0.5rem", borderRadius: 999, marginLeft: "0.25rem" }}>{inCats.length}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Keterangan</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Memuat...</td></tr>
                ) : inCats.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Belum ada kategori pemasukan.</td></tr>
                ) : (
                  inCats.map((c: any, i) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#64748b" }}>{c.description || "-"}</td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }}>Edit</button>
                          <button style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Pengeluaran */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "#e11d48", borderRadius: "50%" }}></div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Pengeluaran</h4>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#ffe4e6", padding: "0.125rem 0.5rem", borderRadius: 999, marginLeft: "0.25rem" }}>{outCats.length}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Keterangan</th>
                  <th style={{ padding: "0.75rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 120 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Memuat...</td></tr>
                ) : outCats.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Belum ada kategori pengeluaran.</td></tr>
                ) : (
                  outCats.map((c: any, i) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "#1e293b" }}>{c.name}</td>
                      <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#64748b" }}>{c.description || "-"}</td>
                      <td style={{ padding: "0.875rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          <button style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }}>Edit</button>
                          <button style={{ display: "inline-flex", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
