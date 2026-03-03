"use client";
import { useState, useEffect, useCallback } from "react";

export default function JournalPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Modal catat transaksi
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: "in", amount: "", cashAccountId: "", categoryId: "", date: new Date().toISOString().split("T")[0], description: "" });
  const [formLoading, setFormLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const loadData = useCallback(async (filter = typeFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/journal?type=${filter}`);
      const json = await res.json();
      if (json.success) {
        setData(json.entries || []);
        setKpi(json.kpi || { totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 });
        if (json.categories) setCategories(json.categories);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [typeFilter]);

  const loadCashAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/cash-accounts");
      const json = await res.json();
      if (json.success) setCashAccounts(json.data || []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadData(); loadCashAccounts(); }, []);

  // === Catat Transaksi Baru ===
  async function handleCreate() {
    if (!form.amount || Number(form.amount) <= 0) { showToast("Jumlah harus lebih dari 0", "error"); return; }
    if (!form.cashAccountId) { showToast("Pilih akun kas", "error"); return; }
    setFormLoading(true);
    try {
      const res = await fetch("/api/journal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          cashAccountId: Number(form.cashAccountId),
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          date: form.date,
          description: form.description,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message);
        setShowCreate(false);
        setForm({ type: "in", amount: "", cashAccountId: "", categoryId: "", date: new Date().toISOString().split("T")[0], description: "" });
        loadData();
        loadCashAccounts();
      } else {
        showToast(json.message, "error");
      }
    } catch { showToast("Gagal mencatat transaksi", "error"); }
    finally { setFormLoading(false); }
  }

  // === Void Transaksi ===
  async function handleVoid(txId: number) {
    if (!confirm("Yakin ingin VOID transaksi ini? Saldo kas akan dikembalikan.")) return;
    try {
      const res = await fetch(`/api/journal/${txId}/void`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); loadCashAccounts(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal void transaksi", "error"); }
  }

  const thStyle: React.CSSProperties = { padding: "0.875rem 1.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "0.875rem 1.25rem", borderRadius: "0.75rem", background: toast.type === "success" ? "#059669" : "#e11d48", color: "#fff", fontWeight: 600, fontSize: "0.8125rem", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a 0%,#312e81 50%,#4f46e5 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
        <div style={{ padding: "2.5rem 2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <svg style={{ width: 22, height: 22, color: "#fff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.5rem", color: "#fff", margin: 0 }}>Kas & Jurnal Umum</h2>
              </div>
              <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", maxWidth: 500, lineHeight: 1.5 }}>Kelola arus kas masuk dan keluar sekolah secara terpusat.</p>
            </div>
            <button onClick={() => setShowCreate(true)} style={{ display: "inline-flex", alignItems: "center", padding: "0.625rem 1.25rem", background: "#fff", color: "#312e81", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: 700, border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", cursor: "pointer" }} className="hover:bg-slate-50 transition-colors">
              <svg style={{ width: "1.25rem", height: "1.25rem", marginRight: "0.375rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Catat Jurnal Baru
            </button>
          </div>

          {/* KPI Cards */}
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

      {/* Akun Kas */}
      {cashAccounts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cashAccounts.map((acc: any) => (
            <div key={acc.id} style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", padding: "1rem 1.25rem" }}>
              <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{acc.name}</p>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: 800, color: acc.balance >= 0 ? "#059669" : "#e11d48", margin: 0 }}>{fmtRp(acc.balance)}</p>
              <p style={{ fontSize: "0.625rem", color: "#94a3b8", marginTop: "0.25rem" }}>{acc.transactionCount} transaksi</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter & Tabel */}
      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#0f172a", margin: 0 }}>Riwayat Jurnal Kas</h3>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); loadData(e.target.value); }} style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem", border: "1px solid #cbd5e1", borderRadius: "0.5rem", color: "#475569", background: "#fff", outline: "none" }}>
            <option value="">Semua Tipe</option>
            <option value="in">Pemasukan (In)</option>
            <option value="out">Pengeluaran (Out)</option>
          </select>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ ...thStyle, width: 50, textAlign: "center" }}>No</th>
                <th style={{ ...thStyle, width: 120 }}>Tgl</th>
                <th style={thStyle}>Keterangan & Kategori</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Penerimaan</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Pengeluaran</th>
                <th style={{ ...thStyle, textAlign: "center", width: 80 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", fontSize: "0.875rem", color: "#64748b" }}>Memuat...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 48, height: 48, background: "#f8fafc", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg style={{ width: 24, height: 24, color: "#cbd5e1" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500, margin: 0 }}>Belum ada riwayat jurnal kas.</p>
                  </div>
                </td></tr>
              ) : data.map((e: any, i: number) => {
                const date = e.date ? new Date(e.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";
                const isIn = e.type === "in";
                const isVoid = e.status === "void";

                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: "1px solid #f1f5f9", opacity: isVoid ? 0.4 : 1 }}>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "center", fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ padding: "0.875rem 1.5rem", fontSize: "0.8125rem", color: "#475569" }}>{date}</td>
                    <td style={{ padding: "0.875rem 1.5rem" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.8125rem", color: "#1e293b", margin: 0 }}>
                        {e.description || "-"}
                        {isVoid && <span style={{ fontSize: "0.6rem", color: "#94a3b8", fontWeight: 700, marginLeft: 6 }}>[VOID]</span>}
                      </p>
                      <span style={{ fontSize: "0.6875rem", color: "#94a3b8" }}>{e.category_name}</span>
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontWeight: 700, color: isIn ? "#059669" : "#cbd5e1", fontSize: "0.8125rem" }}>
                      {isIn ? fmtRp(e.amount) : "-"}
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "right", fontWeight: 700, color: !isIn ? "#e11d48" : "#cbd5e1", fontSize: "0.8125rem" }}>
                      {!isIn ? fmtRp(e.amount) : "-"}
                    </td>
                    <td style={{ padding: "0.875rem 1.5rem", textAlign: "center" }}>
                      {!isVoid ? (
                        <button onClick={() => handleVoid(e.id)} style={{ display: "inline-flex", alignItems: "center", padding: "0.3rem 0.625rem", fontSize: "0.6875rem", fontWeight: 600, color: "#e11d48", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "0.375rem", cursor: "pointer" }} className="hover:bg-red-100 transition-colors">Void</button>
                      ) : <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Transaksi */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowCreate(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: "1rem", width: "100%", maxWidth: 480, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem", color: "#1e293b", margin: 0 }}>Catat Transaksi Baru</h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.375rem" }}>Isi data transaksi pemasukan atau pengeluaran.</p>

            {/* Tipe Toggle */}
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setForm(f => ({ ...f, type: "in" }))} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, border: form.type === "in" ? "2px solid #059669" : "1.5px solid #e2e8f0", background: form.type === "in" ? "#ecfdf5" : "#fff", color: form.type === "in" ? "#059669" : "#64748b", cursor: "pointer" }}>
                ↓ Pemasukan
              </button>
              <button onClick={() => setForm(f => ({ ...f, type: "out" }))} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.625rem", fontSize: "0.8125rem", fontWeight: 700, border: form.type === "out" ? "2px solid #e11d48" : "1.5px solid #e2e8f0", background: form.type === "out" ? "#fff1f2" : "#fff", color: form.type === "out" ? "#e11d48" : "#64748b", cursor: "pointer" }}>
                ↑ Pengeluaran
              </button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Jumlah (Rp)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "1rem", fontWeight: 700, outline: "none" }} />
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Akun Kas *</label>
              <select value={form.cashAccountId} onChange={e => setForm(f => ({ ...f, cashAccountId: e.target.value }))} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">— Pilih Akun Kas —</option>
                {cashAccounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({fmtRp(acc.balance)})</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Kategori</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }}>
                <option value="">— Tanpa Kategori —</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3" style={{ marginTop: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Tanggal</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.6875rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>Keterangan</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Catatan..." style={{ width: "100%", padding: "0.625rem 1rem", border: "1.5px solid #e2e8f0", borderRadius: "0.625rem", fontSize: "0.875rem", outline: "none" }} />
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: "0.625rem 1.25rem", fontSize: "0.8125rem", fontWeight: 600, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: "0.625rem", cursor: "pointer" }}>Batal</button>
              <button onClick={handleCreate} disabled={formLoading} style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", background: formLoading ? "#94a3b8" : form.type === "in" ? "linear-gradient(135deg,#059669,#047857)" : "linear-gradient(135deg,#e11d48,#be123c)", border: "none", borderRadius: "0.625rem", cursor: formLoading ? "not-allowed" : "pointer" }}>
                {formLoading ? "Memproses..." : form.type === "in" ? "Catat Pemasukan" : "Catat Pengeluaran"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
