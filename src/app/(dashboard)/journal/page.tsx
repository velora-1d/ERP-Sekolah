"use client";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const JournalIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const ExportIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default function JournalPage() {
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 });
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: "in", amount: "", cashAccountId: "", categoryId: "", date: new Date().toISOString().split("T")[0], description: "" });
  const [formLoading, setFormLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };
  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const loadData = useCallback(async (filter = typeFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/journal?type=${filter}`);
      const json = await res.json();
      if (json.success) { setData(json.entries || []); setKpi(json.kpi || { totalBalance: 0, thisMonthIn: 0, thisMonthOut: 0 }); if (json.categories) setCategories(json.categories); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [typeFilter]);

  const loadCashAccounts = useCallback(async () => {
    try { const res = await fetch("/api/cash-accounts"); const json = await res.json(); if (json.success) setCashAccounts(json.data || []); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadData(); loadCashAccounts(); }, []);

  async function handleCreate() {
    if (!form.amount || Number(form.amount) <= 0) { showToast("Jumlah harus lebih dari 0", "error"); return; }
    if (!form.cashAccountId) { showToast("Pilih akun kas", "error"); return; }
    setFormLoading(true);
    try {
      const res = await fetch("/api/journal/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: form.type, amount: Number(form.amount), cashAccountId: Number(form.cashAccountId), categoryId: form.categoryId ? Number(form.categoryId) : null, date: form.date, description: form.description }) });
      const json = await res.json();
      if (json.success) { showToast(json.message); setShowCreate(false); setForm({ type: "in", amount: "", cashAccountId: "", categoryId: "", date: new Date().toISOString().split("T")[0], description: "" }); loadData(); loadCashAccounts(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal mencatat transaksi", "error"); } finally { setFormLoading(false); }
  }

  async function handleVoid(txId: number) {
    if (!confirm("Yakin ingin VOID transaksi ini? Saldo kas akan dikembalikan.")) return;
    try {
      const res = await fetch(`/api/journal/${txId}/void`, { method: "POST" });
      const json = await res.json();
      if (json.success) { showToast(json.message); loadData(); loadCashAccounts(); }
      else showToast(json.message, "error");
    } catch { showToast("Gagal void transaksi", "error"); }
  }

  const kpiCards = [
    { label: "Total Saldo Semua Kas", value: fmtRp(kpi.totalBalance), style: "bg-white/10 border-white/20" },
    { label: "Pemasukan (Bulan Ini)", value: fmtRp(kpi.thisMonthIn), style: "bg-emerald-500/15 border-emerald-400/30" },
    { label: "Pengeluaran (Bulan Ini)", value: fmtRp(kpi.thisMonthOut), style: "bg-rose-500/15 border-rose-400/30" },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl animate-fade-in" style={{ background: toast.type === "success" ? "#059669" : "#e11d48" }}>
          {toast.msg}
        </div>
      )}

      {/* Hero + KPI — pakai PageHeader sebagai base tapi dengan KPI cards embedded */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-indigo-600 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-24 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="p-7 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm shrink-0">
                <span className="text-white"><JournalIcon /></span>
              </div>
              <div>
                <h2 className="font-heading font-bold text-2xl text-white m-0 tracking-tight">Kas & Jurnal Umum</h2>
                <p className="text-sm text-white/75 mt-1">Kelola arus kas masuk dan keluar sekolah secara terpusat.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" icon={<ExportIcon />} onClick={() => window.location.href = "/api/journal/export"} className="!text-white !bg-white/10 border border-white/20 hover:!bg-white/25">Export</Button>
              <Button variant="secondary" size="md" icon={<PlusIcon />} onClick={() => setShowCreate(true)}>Catat Jurnal Baru</Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kpiCards.map((k, i) => (
              <div key={i} className={`${k.style} backdrop-blur-xl border rounded-xl p-5`}>
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">{k.label}</p>
                <h3 className="font-heading text-2xl font-extrabold text-white m-0">{k.value}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Akun Kas */}
      {cashAccounts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cashAccounts.map((acc: any) => (
            <div key={acc.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{acc.name}</p>
              <p className={`font-heading text-lg font-extrabold m-0 ${acc.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmtRp(acc.balance)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{acc.transactionCount} transaksi</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-800 to-indigo-600" />
            <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Riwayat Jurnal Kas</h4>
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); loadData(e.target.value); }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 bg-white outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all">
            <option value="">Semua Tipe</option>
            <option value="in">Pemasukan</option>
            <option value="out">Pengeluaran</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["No", "Tanggal", "Keterangan & Kategori", "Penerimaan", "Pengeluaran", "Aksi"].map((h, i) => (
                  <th key={h} className={`px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i >= 4 ? "text-center" : i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <p className="text-sm text-slate-400">Memuat...</p>
                </td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center">
                  <p className="font-heading font-bold text-slate-700">Belum ada riwayat jurnal kas</p>
                  <p className="text-sm text-slate-400 mt-1">Klik "Catat Jurnal Baru" untuk memulai.</p>
                </td></tr>
              ) : data.map((e: any, i: number) => {
                const date = e.date ? new Date(e.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";
                const isIn = e.type === "in";
                const isVoid = e.status === "void";
                return (
                  <tr key={e.id} className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0 ${isVoid ? "opacity-40" : ""}`}>
                    <td className="px-5 py-4 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                    <td className="px-5 py-4 text-sm text-slate-600">{date}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-sm text-slate-800 m-0">
                        {e.description || "-"}
                        {isVoid && <Badge variant="neutral" className="ml-2">VOID</Badge>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{e.category_name}</p>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-bold" style={{ color: isIn ? "#059669" : "#cbd5e1" }}>{isIn ? fmtRp(e.amount) : "-"}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold" style={{ color: !isIn ? "#e11d48" : "#cbd5e1" }}>{!isIn ? fmtRp(e.amount) : "-"}</td>
                    <td className="px-5 py-4 text-center">
                      {!isVoid ? <Button variant="danger" size="sm" onClick={() => handleVoid(e.id)}>Void</Button> : <span className="text-xs text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Transaksi — pengganti modal inline style */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Catat Transaksi Baru" subtitle="Isi data transaksi pemasukan atau pengeluaran."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Batal</Button>
            <Button variant={form.type === "in" ? "primary" : "danger"} onClick={handleCreate} loading={formLoading}>
              {form.type === "in" ? "Catat Pemasukan" : "Catat Pengeluaran"}
            </Button>
          </>
        }>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setForm(f => ({ ...f, type: "in" }))} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${form.type === "in" ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-400" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>↓ Pemasukan</button>
            <button onClick={() => setForm(f => ({ ...f, type: "out" }))} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${form.type === "out" ? "bg-rose-50 text-rose-700 border-2 border-rose-400" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>↑ Pengeluaran</button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah (Rp)</label>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Akun Kas *</label>
            <select value={form.cashAccountId} onChange={e => setForm(f => ({ ...f, cashAccountId: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all bg-white">
              <option value="">— Pilih Akun Kas —</option>
              {cashAccounts.map((acc: any) => <option key={acc.id} value={acc.id}>{acc.name} ({fmtRp(acc.balance)})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all bg-white">
              <option value="">— Tanpa Kategori —</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Catatan..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
