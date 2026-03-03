"use client";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const monthNames: Record<number, string> = {1:'Januari',2:'Februari',3:'Maret',4:'April',5:'Mei',6:'Juni',7:'Juli',8:'Agustus',9:'September',10:'Oktober',11:'November',12:'Desember'};
const monthShort: Record<number, string> = {1:'Jan',2:'Feb',3:'Mar',4:'Apr',5:'Mei',6:'Jun',7:'Jul',8:'Agu',9:'Sep',10:'Okt',11:'Nov',12:'Des'};

const InfaqIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;

export default function InfaqBillsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [genMonths, setGenMonths] = useState<number[]>([]);
  const [genYear, setGenYear] = useState(new Date().getFullYear().toString());
  const [genLoading, setGenLoading] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payNotes, setPayNotes] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const loadData = useCallback(async (qObj = { s: search, m: month, st: status }) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (qObj.s) q.append("search", qObj.s); if (qObj.m) q.append("month", qObj.m); if (qObj.st) q.append("status", qObj.st);
      const res = await fetch(`/api/infaq-bills?${q.toString()}`); const json = await res.json(); if (json.success) setData(json.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [search, month, status]);

  useEffect(() => { loadData(); }, []);

  async function handleGenerate() {
    if (genMonths.length === 0) { showToast("Pilih minimal 1 bulan", "error"); return; }
    setGenLoading(true);
    try { const res = await fetch("/api/infaq-bills/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ months: genMonths.map(String), year: genYear }) }); const json = await res.json(); if (json.success) { showToast(json.message); setShowGenerate(false); setGenMonths([]); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal generate", "error"); } finally { setGenLoading(false); }
  }

  async function handlePayment() {
    if (!selectedBill || !payAmount) return; setPayLoading(true);
    try { const res = await fetch("/api/infaq-payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ billId: selectedBill.id, amountPaid: Number(payAmount), paymentDate: payDate, notes: payNotes }) }); const json = await res.json(); if (json.success) { showToast(json.message); setShowPayment(false); setSelectedBill(null); setPayAmount(""); setPayNotes(""); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal bayar", "error"); } finally { setPayLoading(false); }
  }

  async function handleVoid(billId: number) { if (!confirm("Yakin VOID tagihan ini?")) return; try { const res = await fetch(`/api/infaq-bills/${billId}/void`, { method: "POST" }); const json = await res.json(); if (json.success) { showToast(json.message); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal void", "error"); } }
  async function handleRevert(billId: number) { if (!confirm("Yakin REVERT tagihan ini?")) return; try { const res = await fetch(`/api/infaq-bills/${billId}/revert`, { method: "POST" }); const json = await res.json(); if (json.success) { showToast(json.message); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal revert", "error"); } }

  function toggleGenMonth(m: number) { setGenMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]); }

  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) { const val = e.target.value; setSearch(val); clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadData({ s: val, m: month, st: status }), 400); }

  const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "neutral"; label: string }> = {
    lunas: { variant: "success", label: "✓ Lunas" }, sebagian: { variant: "warning", label: "◐ Sebagian" },
    belum_lunas: { variant: "danger", label: "✗ Belum Lunas" }, void: { variant: "neutral", label: "Void" },
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {toast && <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl" style={{ background: toast.type === "success" ? "#059669" : "#e11d48" }}>{toast.msg}</div>}

      <PageHeader title="Tagihan Infaq / SPP" subtitle="Kelola tagihan bulanan dan status pembayaran siswa." icon={<InfaqIcon />} gradient="from-amber-500 via-amber-600 to-amber-800"
        actions={<Button variant="secondary" size="md" icon={<PlusIcon />} onClick={() => setShowGenerate(true)}>Generate Tagihan</Button>} />

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-500 to-amber-700" />
          <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Filter Data</h4>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Cari Nama</label>
            <input type="text" value={search} onChange={handleSearch} placeholder="Ketik nama..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bulan</label>
            <select value={month} onChange={e => { setMonth(e.target.value); loadData({ s: search, m: e.target.value, st: status }); }} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-amber-200">
              <option value="">Semua</option>
              {Array.from({length:12}).map((_,i) => <option key={i+1} value={String(i+1)}>{monthShort[i+1]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
            <select value={status} onChange={e => { setStatus(e.target.value); loadData({ s: search, m: month, st: e.target.value }); }} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-amber-200">
              <option value="">Semua</option>
              <option value="belum_lunas">Belum Lunas</option>
              <option value="sebagian">Sebagian</option>
              <option value="lunas">Lunas</option>
              <option value="void">Void</option>
            </select>
          </div>
          <div><Button variant="primary" onClick={() => loadData()} className="w-full">Filter</Button></div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-500 to-amber-700" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Tagihan</h4></div>
          <Badge variant="warning">{data.length} data</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["No", "Siswa", "Kelas", "Periode", "Nominal", "Status", "Aksi"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 ? "text-center w-12" : i >= 4 ? "text-center" : "text-left"} ${i === 4 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center"><svg className="animate-spin w-6 h-6 mx-auto mb-2 text-amber-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><p className="text-sm text-slate-400">Memuat...</p></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="p-16 text-center"><p className="font-heading font-bold text-slate-700">Belum Ada Tagihan</p><p className="text-sm text-slate-400 mt-1">Klik <strong>Generate Tagihan</strong> untuk membuat.</p></td></tr>
              ) : data.map((b: any, i: number) => {
                const sm = statusMap[b.status] || { variant: "neutral" as const, label: b.status };
                return (
                  <tr key={b.id} className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0 ${b.status === "void" ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3.5 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center font-bold text-sm text-amber-700 shrink-0">{(b.student_name || "?").charAt(0).toUpperCase()}</div>
                        <div><p className="font-semibold text-sm text-slate-800 m-0">{b.student_name || "-"}</p><p className="text-xs text-slate-400 mt-0.5">{b.nisn || "-"}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><Badge variant="info">{b.classroom || "-"}</Badge></td>
                    <td className="px-4 py-3.5"><p className="font-semibold text-sm text-slate-800 m-0">{monthShort[b.month] || "-"}</p><p className="text-xs text-slate-400 mt-0.5">{b.academic_year || b.year || "-"}</p></td>
                    <td className="px-4 py-3.5 text-right">{b.nominal <= 0 ? <span className="font-bold text-sm text-emerald-600">GRATIS</span> : <span className="font-bold text-sm text-slate-800">Rp {Number(b.nominal).toLocaleString("id-ID")}</span>}</td>
                    <td className="px-4 py-3.5 text-center"><Badge variant={sm.variant} dot>{sm.label}</Badge></td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        {(b.status === "belum_lunas" || b.status === "sebagian") && <>
                          <Button variant="outline" size="sm" onClick={() => { setSelectedBill(b); setPayAmount(String(b.nominal)); setShowPayment(true); }} className="!text-emerald-600 !border-emerald-200 hover:!bg-emerald-50">Bayar</Button>
                          <Button variant="danger" size="sm" onClick={() => handleVoid(b.id)}>Void</Button>
                        </>}
                        {b.status === "lunas" && <Button variant="outline" size="sm" onClick={() => handleRevert(b.id)} className="!text-amber-600 !border-amber-200 hover:!bg-amber-50">Revert</Button>}
                        {b.status === "void" && <span className="text-xs text-slate-300">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Generate */}
      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Tagihan Baru" subtitle="Pilih bulan dan tahun untuk generate tagihan infaq/SPP." size="lg"
        footer={<><Button variant="secondary" onClick={() => setShowGenerate(false)}>Batal</Button><Button variant="primary" onClick={handleGenerate} loading={genLoading}>Generate {genMonths.length} Bulan</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Bulan (bisa lebih dari 1)</label>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({length:12}).map((_,i) => { const m = i+1; const sel = genMonths.includes(m); return (
                <button key={m} onClick={() => toggleGenMonth(m)} className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${sel ? "bg-amber-100 text-amber-800 border-2 border-amber-400" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"}`}>{monthNames[m]}</button>
              ); })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tahun</label>
            <input type="text" value={genYear} onChange={e => setGenYear(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 transition-all" />
          </div>
        </div>
      </Modal>

      {/* Modal Bayar */}
      <Modal open={showPayment && !!selectedBill} onClose={() => setShowPayment(false)} title="Bayar Tagihan" subtitle={selectedBill ? `${selectedBill.student_name} — ${monthShort[selectedBill.month]} ${selectedBill.year}` : ""}
        footer={<><Button variant="secondary" onClick={() => setShowPayment(false)}>Batal</Button><Button variant="primary" onClick={handlePayment} loading={payLoading}>Bayar Sekarang</Button></>}>
        <div className="space-y-4">
          {selectedBill && <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-sm"><span className="text-slate-500">Nominal Tagihan</span><span className="font-bold text-slate-800">Rp {Number(selectedBill.nominal).toLocaleString("id-ID")}</span></div>}
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Bayar</label><input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 transition-all" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Bayar</label><input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 transition-all" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Catatan (opsional)</label><input type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="Keterangan..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-200 transition-all" /></div>
        </div>
      </Modal>
    </div>
  );
}
