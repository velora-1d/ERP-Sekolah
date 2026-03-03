"use client";
import { useState, useEffect } from "react";

export default function PpdbPage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  async function loadData(q = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/ppdb?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setStats(json.stats);
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

  let debounceTimer: any;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setSearch(q);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadData(q);
    }, 400);
  }

  function formatRp(n: number) {
    return Number(n || 0).toLocaleString('id-ID');
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#0ea5e9 0%,#0284c7 50%,#0369a1 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>Penerimaan Siswa Baru (PPDB)</h2>
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)", margin: "0.125rem 0 0" }}>Atur biaya pendaftaran, buku, seragam & lihat rekap penerimaan kas</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1rem", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 600, fontSize: "0.6875rem", border: "1.5px solid rgba(255,255,255,0.25)", cursor: "pointer" }}>
                <svg style={{ width: "0.8rem", height: "0.8rem", marginRight: "0.25rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Export
              </button>
              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.625rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>
                <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Tambah Manual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Pengaturan & Rekap Biaya */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div onClick={() => setShowSettings(!showSettings)} style={{ padding: "1.25rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "linear-gradient(135deg,#f0f9ff 0%,#f8fafc 100%)", borderBottom: showSettings ? "1.5px solid #e2e8f0" : "none" }} className="hover:bg-sky-50 transition-colors">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(14,165,233,0.3)" }}>
              <svg style={{ width: 18, height: 18, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Pengaturan & Rekap Biaya PPDB</h4>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.125rem 0 0" }}>Atur biaya pendaftaran, buku, seragam & lihat rekap penerimaan kas</p>
            </div>
          </div>
          <div style={{ width: 28, height: 28, background: "#f1f5f9", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
            <svg style={{ width: 14, height: 14, color: "#64748b", transition: "transform 0.25s ease", transform: showSettings ? "rotate(180deg)" : "none" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        
        {showSettings && (
          <div style={{ padding: "1.75rem" }}>
            {/* Rekap Keuangan */}
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 0.875rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <svg style={{ width: 15, height: 15, color: "#0ea5e9" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Rekap Penerimaan Kas PPDB
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div style={{ background: "linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)", border: "1.5px solid #7dd3fc", padding: "1rem", borderRadius: "0.75rem", textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, background: "#0ea5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <svg style={{ width: 14, height: 14, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#0284c7", margin: 0 }}>Pendaftaran</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.0625rem", color: "#075985", margin: "0.375rem 0 0" }}>Rp {formatRp(stats?.payments?.total_fee)}</p>
                  <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: "0.25rem 0 0" }}>{stats?.payments?.count_fee || 0} pendaftar lunas</p>
                </div>
                <div style={{ background: "linear-gradient(135deg,#fefce8 0%,#fef9c3 100%)", border: "1.5px solid #fcd34d", padding: "1rem", borderRadius: "0.75rem", textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, background: "#f59e0b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <svg style={{ width: 14, height: 14, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", margin: 0 }}>Buku / LKS</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.0625rem", color: "#92400e", margin: "0.375rem 0 0" }}>Rp {formatRp(stats?.payments?.total_books)}</p>
                  <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: "0.25rem 0 0" }}>{stats?.payments?.count_books || 0} pendaftar lunas</p>
                </div>
                <div style={{ background: "linear-gradient(135deg,#fdf2f8 0%,#fce7f3 100%)", border: "1.5px solid #f9a8d4", padding: "1rem", borderRadius: "0.75rem", textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, background: "#ec4899", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <svg style={{ width: 14, height: 14, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                  </div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#db2777", margin: 0 }}>Seragam</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.0625rem", color: "#9d174d", margin: "0.375rem 0 0" }}>Rp {formatRp(stats?.payments?.total_uniform)}</p>
                  <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: "0.25rem 0 0" }}>{stats?.payments?.count_uniform || 0} pendaftar lunas</p>
                </div>
                <div style={{ background: "linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)", border: "1.5px solid #6ee7b7", padding: "1rem", borderRadius: "0.75rem", textAlign: "center" }}>
                  <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
                    <svg style={{ width: 14, height: 14, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#059669", margin: 0 }}>Total Penerimaan</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.125rem", color: "#047857", margin: "0.375rem 0 0" }}>Rp {formatRp(stats?.payments?.grand_total)}</p>
                  <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: "0.25rem 0 0" }}>Masuk ke Kas Umum</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistik Pendaftar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Total Pendaftar</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#1e293b", margin: "0.25rem 0 0" }}>{stats?.total || 0}</p>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Menunggu</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#f59e0b", margin: "0.25rem 0 0" }}>{stats?.pending || 0}</p>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Diterima</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#10b981", margin: "0.25rem 0 0" }}>{stats?.diterima || 0}</p>
        </div>
        <div style={{ background: "#fff", padding: "1.25rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Ditolak</p>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#f43f5e", margin: "0.25rem 0 0" }}>{stats?.ditolak || 0}</p>
        </div>
      </div>

      {/* Tabel Pendaftar */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#0ea5e9,#0284c7)", borderRadius: "50%" }}></div>
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Pendaftar PPDB</h4>
          </div>
          <input type="text" value={search} onChange={handleSearch} placeholder="Cari nama/no reg..." style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", border: "1px solid #e2e8f0", borderRadius: "0.625rem", width: 220, outline: "none" }} />
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={{ padding: "0.875rem 1rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0", width: 50 }}>No</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>No. Registrasi</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Nama Calon Siswa</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>L/P</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Status</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Administrasi</th>
                <th style={{ padding: "0.875rem 1rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>Memuat data pendaftar...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "3rem 2rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontStyle: "italic" }}>Belum ada pendaftar PPDB.</td></tr>
              ) : (
                data.map((reg: any, i) => {
                  const genderBadge = reg.gender === "L"
                    ? <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.25rem 0.625rem", borderRadius: 999, color: "#6366f1", background: "#eef2ff" }}>Putra</span>
                    : <span style={{ fontSize: "0.6875rem", fontWeight: 600, padding: "0.25rem 0.625rem", borderRadius: 999, color: "#ec4899", background: "#fdf2f8" }}>Putri</span>;
                  
                  let statusBadge;
                  if (reg.status === "menunggu") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fef3c7", borderRadius: 999 }}>⏳ Menunggu</span>;
                  else if (reg.status === "diterima") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}>✓ Diterima</span>;
                  else if (reg.status === "ditolak") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#be123c", background: "#ffe4e6", borderRadius: 999 }}>✗ Ditolak</span>;

                  // Render payment status buttons
                  const p = reg.payment;
                  const feePD = stats?.payments?.fee_amount || 0;
                  const feeBK = stats?.payments?.books_amount || 0;
                  const feeSR = stats?.payments?.uniform_amount || 0;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "1rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: "1rem", fontSize: "0.8125rem", fontWeight: 600, color: "#0ea5e9" }}>{reg.form_no || reg.id.slice(24)}</td>
                      <td style={{ padding: "1rem" }}>
                        <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{reg.student_name || "-"}</p>
                        <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>{reg.parent_name || "-"}</p>
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>{genderBadge}</td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>{statusBadge}</td>
                      <td style={{ padding: "1rem", textAlign: "left", verticalAlign: "top" }}>
                        {!p ? <span style={{ color: "#cbd5e1", fontSize: "0.6875rem" }}>—</span> : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", minWidth: 140 }}>
                            <button className={`ppdb-badge ${p.is_fee_paid ? 'ppdb-active' : ''}`} style={{ fontFamily: "var(--font-heading)", fontSize: "0.65rem", fontWeight: 600, padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: `1px solid ${p.is_fee_paid?"#a7f3d0":"#e2e8f0"}`, background: p.is_fee_paid?"#ecfdf5":"#f8fafc", color: p.is_fee_paid?"#059669":"#64748b", display: "inline-flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                              <span>Daftar {feePD > 0 && <span style={{ opacity: 0.6 }}>({feePD/1000}k)</span>}</span>
                              <span style={{ fontWeight: 800 }}>{p.is_fee_paid ? '✓' : '−'}</span>
                            </button>
                            <div style={{ display: "flex", gap: "0.25rem" }}>
                              <button className={`ppdb-badge ${p.is_books_paid ? 'ppdb-active' : ''}`} style={{ flex: 1, fontFamily: "var(--font-heading)", fontSize: "0.65rem", fontWeight: 600, padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: `1px solid ${p.is_books_paid?"#a7f3d0":"#e2e8f0"}`, background: p.is_books_paid?"#ecfdf5":"#f8fafc", color: p.is_books_paid?"#059669":"#64748b", display: "inline-flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span>Buku {feeBK > 0 && <span style={{ opacity: 0.6 }}>({feeBK/1000}k)</span>}</span>
                                <span style={{ fontWeight: 800 }}>{p.is_books_paid ? '✓' : '−'}</span>
                              </button>
                              <button className={`ppdb-badge ${p.is_books_received ? 'ppdb-active' : ''}`} style={{ flex: 1, fontFamily: "var(--font-heading)", fontSize: "0.65rem", fontWeight: 600, padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: `1px solid ${p.is_books_received?"#a7f3d0":"#e2e8f0"}`, background: p.is_books_received?"#ecfdf5":"#f8fafc", color: p.is_books_received?"#059669":"#64748b", display: "inline-flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span>Ambil</span>
                                <span style={{ fontWeight: 800 }}>{p.is_books_received ? '✓' : '−'}</span>
                              </button>
                            </div>
                            <div style={{ display: "flex", gap: "0.25rem" }}>
                              <button className={`ppdb-badge ${p.is_uniform_paid ? 'ppdb-active' : ''}`} style={{ flex: 1, fontFamily: "var(--font-heading)", fontSize: "0.65rem", fontWeight: 600, padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: `1px solid ${p.is_uniform_paid?"#a7f3d0":"#e2e8f0"}`, background: p.is_uniform_paid?"#ecfdf5":"#f8fafc", color: p.is_uniform_paid?"#059669":"#64748b", display: "inline-flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span>Seragam {feeSR > 0 && <span style={{ opacity: 0.6 }}>({feeSR/1000}k)</span>}</span>
                                <span style={{ fontWeight: 800 }}>{p.is_uniform_paid ? '✓' : '−'}</span>
                              </button>
                              <button className={`ppdb-badge ${p.is_uniform_received ? 'ppdb-active' : ''}`} style={{ flex: 1, fontFamily: "var(--font-heading)", fontSize: "0.65rem", fontWeight: 600, padding: "0.375rem 0.5rem", borderRadius: "0.375rem", border: `1px solid ${p.is_uniform_received?"#a7f3d0":"#e2e8f0"}`, background: p.is_uniform_received?"#ecfdf5":"#f8fafc", color: p.is_uniform_received?"#059669":"#64748b", display: "inline-flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span>Ambil</span>
                                <span style={{ fontWeight: 800 }}>{p.is_uniform_received ? '✓' : '−'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                          <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: "0.5rem", cursor: "pointer" }}>Detail</button>
                          {reg.status === "menunggu" && (
                            <>
                              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "0.5rem", cursor: "pointer" }}>Terima</button>
                              <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.5rem", cursor: "pointer" }}>Tolak</button>
                            </>
                          )}
                          {reg.status === "diterima" && (
                            <button style={{ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>Konversi</button>
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
