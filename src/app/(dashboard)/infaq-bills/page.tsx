"use client";
import { useState, useEffect } from "react";

export default function InfaqBillsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  async function loadData(qObj = { s: search, m: month, st: status }) {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (qObj.s) q.append("search", qObj.s);
      if (qObj.m) q.append("month", qObj.m);
      if (qObj.st) q.append("status", qObj.st);

      const res = await fetch(`/api/infaq-bills?${q.toString()}`);
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

  let debounceTimer: any;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadData({ s: val, m: month, st: status });
    }, 400);
  }

  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setMonth(e.target.value);
    loadData({ s: search, m: e.target.value, st: status });
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(e.target.value);
    loadData({ s: search, m: month, st: e.target.value });
  }

  const monthNames: Record<number, string> = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Agu',9:'Sep',10:'Okt',11:'Nov',12:'Des'};

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#f59e0b 0%,#d97706 50%,#b45309 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Tagihan Infaq / SPP</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Kelola tagihan bulanan dan status pembayaran siswa.</p>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.25)", cursor: "pointer", transition: "all 0.2s ease" }} className="hover:bg-white/30">
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export Excel
              </button>
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer", transition: "all 0.2s ease" }} className="hover:bg-white/30">
                <svg style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Generate Tagihan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: "50%" }}></div>
          <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Filter Data</h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Cari Nama</label>
            <input type="text" value={search} onChange={handleSearch} placeholder="Ketik nama..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} className="focus:border-amber-500 transition-colors" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Bulan</label>
            <select value={month} onChange={handleMonthChange} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
              <option value="">Semua</option>
              {Array.from({length: 12}).map((_, i) => (
                <option key={i+1} value={String(i+1)}>{monthNames[i+1]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Status</label>
            <select value={status} onChange={handleStatusChange} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
              <option value="">Semua</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="lunas">Lunas</option>
              <option value="void">Void</option>
            </select>
          </div>
          <div>
            <button onClick={() => loadData()} style={{ width: "100%", display: "inline-flex", justifyContent: "center", alignItems: "center", padding: "0.625rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: "0.625rem", cursor: "pointer", transition: "all 0.15s ease" }} className="hover:opacity-90 active:scale-95">
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>Filter
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Tagihan */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: "50%" }}></div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Tagihan</h4>
          </div>
          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fef3c7", padding: "0.25rem 0.75rem", borderRadius: 999 }}>{data.length} Data</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>No</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Siswa</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Kelas</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Periode</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nominal</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8" }}>Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "4rem 2rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                      <svg style={{ width: 28, height: 28, color: "#d97706" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.9375rem", color: "#1e293b", margin: 0 }}>Belum Ada Tagihan</p>
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>Generate tagihan terlebih dahulu (atau tidak ada data).</p>
                  </div>
                </td></tr>
              ) : (
                data.map((b: any, i) => {
                  const initial = (b.student_name || "?").charAt(0).toUpperCase();

                  let statusBadge;
                  if (b.status === "lunas") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}><svg style={{ width: "0.75rem", height: "0.75rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>Lunas</span>;
                  else if (b.status === "belum_lunas") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#be123c", background: "#ffe4e6", borderRadius: 999 }}><svg style={{ width: "0.75rem", height: "0.75rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Belum Lunas</span>;
                  else statusBadge = <span style={{ display: "inline-flex", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6b7280", background: "#e5e7eb", borderRadius: 999 }}>Void</span>;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9", opacity: b.status === "void" ? 0.45 : 1 }}>
                      <td style={{ padding: "1rem 1.5rem", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#fef3c7,#fde68a)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8125rem", color: "#b45309" }}>{initial}</div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{b.student_name || "-"}</p>
                            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>{b.nisn || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{b.classroom || "-"}</span>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{monthNames[b.month] || "-"}</p>
                        <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>{b.academic_year || "-"}</p>
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                        {b.nominal <= 0 ? <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#059669" }}>GRATIS</span> : <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#1e293b" }}>Rp {Number(b.nominal).toLocaleString('id-ID')}</span>}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                      <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem" }}>
                          {b.status === "belum_lunas" ? (
                            <>
                              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "0.5rem", cursor: "pointer" }}>Bayar</button>
                              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Void</button>
                            </>
                          ) : b.status === "lunas" ? (
                            <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "0.5rem", cursor: "pointer" }}>Buka</button>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
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
