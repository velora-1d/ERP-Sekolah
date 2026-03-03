"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const monthNames: Record<number, string> = {1:'Januari',2:'Februari',3:'Maret',4:'April',5:'Mei',6:'Juni',7:'Juli',8:'Agustus',9:'September',10:'Oktober',11:'November',12:'Desember'};
const monthShort: Record<number, string> = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Agu',9:'Sep',10:'Okt',11:'Nov',12:'Des'};

export default function InfaqBillsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);

  // Generate form
  const [genMonths, setGenMonths] = useState<number[]>([]);
  const [genYear, setGenYear] = useState(new Date().getFullYear().toString());
  const [genLoading, setGenLoading] = useState(false);

  // Payment form
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payNotes, setPayNotes] = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payMethod, setPayMethod] = useState("tunai");
  const [payCashId, setPayCashId] = useState("");
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = useCallback(async (qObj = { s: search, m: month, st: status }) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (qObj.s) q.append("search", qObj.s);
      if (qObj.m) q.append("month", qObj.m);
      if (qObj.st) q.append("status", qObj.st);
      const res = await fetch(`/api/infaq-bills?${q.toString()}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, month, status]);

  useEffect(() => {
    loadData();
    fetch("/api/cash-accounts").then(r => r.json()).then(j => { if (j.success) setCashAccounts(j.data || []); }).catch(() => {});
  }, []);

  // === Generate Tagihan ===
  async function handleGenerate() {
    if (genMonths.length === 0) { showToast("Pilih minimal 1 bulan", "error"); return; }
    setGenLoading(true);
    try {
      const res = await fetch("/api/infaq-bills/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months: genMonths.map(String), year: genYear }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowGenerate(false);
        setGenMonths([]);
        loadData();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal generate tagihan", "error"); }
    finally { setGenLoading(false); }
  }

  // === Bayar Tagihan ===
  async function handlePayment() {
    if (!selectedBill || !payAmount) return;
    if (payMethod !== "tabungan" && !payCashId) { showToast("Pilih akun kas terlebih dahulu", "error"); return; }
    setPayLoading(true);
    try {
      const res = await fetch("/api/infaq-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: selectedBill.id,
          amountPaid: Number(payAmount),
          paymentDate: payDate,
          notes: payNotes,
          paymentMethod: payMethod,
          cashAccountId: payCashId ? Number(payCashId) : null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowPayment(false);
        setSelectedBill(null);
        setPayAmount("");
        setPayNotes("");
        setPayMethod("tunai");
        setPayCashId("");
        loadData();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal memproses pembayaran", "error"); }
    finally { setPayLoading(false); }
  }

  // === Edit Nominal Tagihan ===
  async function handleEditNominal(bill: any) {
    const newNominal = prompt(`Edit nominal tagihan ${bill.student_name}:`, String(bill.nominal));
    if (!newNominal || isNaN(Number(newNominal))) return;
    try {
      const res = await fetch(`/api/infaq-bills/${bill.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nominal: Number(newNominal) }),
      });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal edit tagihan", "error"); }
  }

  // === Hapus Tagihan ===
  async function handleDelete(billId: number) {
    if (!confirm("Yakin ingin HAPUS tagihan ini? Tagihan yang sudah ada pembayaran tidak bisa dihapus.")) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal hapus tagihan", "error"); }
  }

  // === Void Tagihan ===
  async function handleVoid(billId: number) {
    if (!confirm("Yakin ingin VOID tagihan ini?")) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}/void`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal void tagihan", "error"); }
  }

  // === Revert Tagihan ===
  async function handleRevert(billId: number) {
    if (!confirm("Yakin ingin REVERT tagihan ini? Status kembali ke belum lunas.")) return;
    try {
      const res = await fetch(`/api/infaq-bills/${billId}/revert`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal revert tagihan", "error"); }
  }

  function toggleGenMonth(m: number) {
    setGenMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadData({ s: val, m: month, st: status }), 400);
  }

  const thStyle: React.CSSProperties = { padding: "0.875rem 1.5rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1.5px solid #e2e8f0" };
  const btnStyle = (color: string, bg: string, border: string): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", padding: "0.375rem 0.75rem", fontSize: "0.6875rem", fontWeight: 600, color, background: bg, border: `1px solid ${border}`, borderRadius: "0.5rem", cursor: "pointer", transition: "all 0.15s" });

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "0.875rem 1.25rem", borderRadius: "0.75rem", background: toast.type === "success" ? "#059669" : "#e11d48", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#f59e0b 0%,#d97706 50%,#b45309 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
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
            <button onClick={() => setShowGenerate(true)} style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: "0.75rem", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", border: "1.5px solid rgba(255,255,255,0.3)", cursor: "pointer" }} className="hover:bg-white/30">
              <svg style={{ width: "1rem", height: "1rem", marginRight: "0.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Generate Tagihan
            </button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: "50%" }} />
          <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Filter Data</h4>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Cari Nama</label>
            <input type="text" value={search} onChange={handleSearch} placeholder="Ketik nama..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} className="focus:border-amber-500 transition-colors" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Bulan</label>
            <select value={month} onChange={e => { setMonth(e.target.value); loadData({ s: search, m: e.target.value, st: status }); }} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
              <option value="">Semua</option>
              {Array.from({length: 12}).map((_, i) => <option key={i+1} value={String(i+1)}>{monthShort[i+1]}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Status</label>
            <select value={status} onChange={e => { setStatus(e.target.value); loadData({ s: search, m: month, st: e.target.value }); }} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
              <option value="">Semua</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="sebagian">Sebagian</option>
              <option value="lunas">Lunas</option>
              <option value="void">Void</option>
            </select>
          </div>
          <div>
            <button onClick={() => loadData()} style={{ width: "100%", display: "inline-flex", justifyContent: "center", alignItems: "center", padding: "0.625rem 1rem", fontSize: "0.75rem", fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", borderRadius: "0.625rem", cursor: "pointer" }} className="hover:opacity-90 active:scale-95">
              <svg style={{ width: "0.875rem", height: "0.875rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>Filter
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Tagihan */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, background: "linear-gradient(135deg,#f59e0b,#d97706)", borderRadius: "50%" }} />
            <h4 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "0.875rem", color: "#1e293b", margin: 0 }}>Daftar Tagihan</h4>
          </div>
          <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fef3c7", padding: "0.25rem 0.75rem", borderRadius: 999 }}>{data.length} Data</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)" }}>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Siswa</th>
                <th style={thStyle}>Kelas</th>
                <th style={thStyle}>Periode</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Nominal</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
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
                    <p style={{ fontSize: "0.8125rem", color: "#94a3b8", marginTop: "0.375rem" }}>Klik <strong>Generate Tagihan</strong> untuk membuat tagihan baru.</p>
                  </div>
                </td></tr>
              ) : data.map((b: any, i: number) => {
                const initial = (b.student_name || "?").charAt(0).toUpperCase();
                let statusBadge;
                if (b.status === "lunas") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#047857", background: "#d1fae5", borderRadius: 999 }}>✓ Lunas</span>;
                else if (b.status === "sebagian") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#d97706", background: "#fef3c7", borderRadius: 999 }}>◐ Sebagian</span>;
                else if (b.status === "belum_lunas") statusBadge = <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.25rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#be123c", background: "#ffe4e6", borderRadius: 999 }}>✗ Belum Lunas</span>;
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
                    <td style={{ padding: "1rem 1.5rem" }}><span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#6366f1", background: "#eef2ff", padding: "0.25rem 0.625rem", borderRadius: 999 }}>{b.classroom || "-"}</span></td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>{monthShort[b.month] || "-"}</p>
                      <p style={{ fontSize: "0.6875rem", color: "#94a3b8", marginTop: "0.125rem" }}>{b.academic_year || b.year || "-"}</p>
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                      {b.nominal <= 0 ? <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#059669" }}>GRATIS</span> : <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#1e293b" }}>Rp {Number(b.nominal).toLocaleString("id-ID")}</span>}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>{statusBadge}</td>
                    <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "0.375rem", flexWrap: "wrap" }}>
                        {b.status === "belum_lunas" || b.status === "sebagian" ? (
                          <>
                            <button onClick={() => { setSelectedBill(b); setPayAmount(String(b.nominal - (b.total_paid || 0))); setShowPayment(true); }} style={btnStyle("#059669", "#ecfdf5", "#a7f3d0")}>Bayar</button>
                            <button onClick={() => handleEditNominal(b)} style={btnStyle("#6366f1", "#eef2ff", "#c7d2fe")}>Edit</button>
                            <button onClick={() => handleVoid(b.id)} style={btnStyle("#e11d48", "#fff1f2", "#fecdd3")}>Void</button>
                            <button onClick={() => handleDelete(b.id)} style={btnStyle("#64748b", "#f8fafc", "#e2e8f0")}>Hapus</button>
                          </>
                        ) : b.status === "lunas" ? (
                          <button onClick={() => handleRevert(b.id)} style={btnStyle("#d97706", "#fef3c7", "#fde68a")}>Revert</button>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>—</span>
                        )}
                        {b.student_id && <button onClick={() => router.push(`/infaq-bills/tracking/${b.student_id}`)} style={btnStyle("#0ea5e9", "#f0f9ff", "#bae6fd")}>Tracking</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Generate Tagihan */}
      {showGenerate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowGenerate(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 520, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Generate Tagihan Baru</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>Pilih bulan dan tahun untuk generate tagihan infaq/SPP.</p>

            <div style={{ marginTop: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>Pilih Bulan (bisa lebih dari 1)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                {Array.from({length: 12}).map((_, i) => {
                  const m = i + 1;
                  const selected = genMonths.includes(m);
                  return (
                    <button key={m} onClick={() => toggleGenMonth(m)} style={{ padding: "0.5rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 600, border: selected ? "2px solid #f59e0b" : "1.5px solid #e2e8f0", background: selected ? "#fef3c7" : "#fff", color: selected ? "#b45309" : "#64748b", cursor: "pointer", transition: "all 0.15s" }}>
                      {monthNames[m]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tahun</label>
              <input type="text" value={genYear} onChange={e => setGenYear(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowGenerate(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handleGenerate} disabled={genLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: genLoading ? "#94a3b8" : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: "0.625rem", cursor: genLoading ? "not-allowed" : "pointer" }}>
                {genLoading ? "Memproses..." : `Generate ${genMonths.length} Bulan`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bayar Tagihan */}
      {showPayment && selectedBill && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowPayment(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 440, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Bayar Tagihan</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>{selectedBill.student_name} — {monthShort[selectedBill.month]} {selectedBill.year}</p>

            <div style={{ marginTop: "1rem", padding: "1rem", background: "#f8fafc", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                <span style={{ color: "#64748b" }}>Nominal Tagihan</span>
                <span style={{ fontWeight: 700, color: "#1e293b" }}>Rp {Number(selectedBill.nominal).toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Metode Pembayaran</label>
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="tunai">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="tabungan">Potong Tabungan</option>
              </select>
            </div>

            {payMethod !== "tabungan" && (
              <div style={{ marginTop: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Akun Kas</label>
                <select value={payCashId} onChange={e => setPayCashId(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                  <option value="">— Pilih Akun Kas —</option>
                  {cashAccounts.map((ca: any) => <option key={ca.id} value={ca.id}>{ca.name} (Rp {Number(ca.balance).toLocaleString("id-ID")})</option>)}
                </select>
              </div>
            )}

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Jumlah Bayar</label>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tanggal Bayar</label>
              <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Catatan (opsional)</label>
              <input type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="Keterangan..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowPayment(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handlePayment} disabled={payLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: payLoading ? "#94a3b8" : "linear-gradient(135deg,#059669,#047857)", border: "none", borderRadius: "0.625rem", cursor: payLoading ? "not-allowed" : "pointer" }}>
                {payLoading ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
