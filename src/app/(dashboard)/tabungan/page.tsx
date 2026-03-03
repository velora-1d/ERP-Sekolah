"use client";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const TabunganIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default function TabunganPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showTransaction, setShowTransaction] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [txType, setTxType] = useState<"setor" | "tarik">("setor");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [txDesc, setTxDesc] = useState("");
  const [txLoading, setTxLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyBalance, setHistoryBalance] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };
  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  const loadData = useCallback(async (filter = classFilter) => {
    setLoading(true);
    try { const res = await fetch(`/api/tabungan?classId=${filter}`); const json = await res.json(); if (json.success) setData(json.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [classFilter]);

  async function loadClassrooms() { try { const res = await fetch("/api/classrooms"); const json = await res.json(); if (json.success) setClassrooms(json.data); } catch (e) { console.error(e); } }
  useEffect(() => { loadClassrooms(); loadData(); }, []);

  async function handleTransaction() {
    if (!selectedStudent || !txAmount || Number(txAmount) <= 0) { showToast("Jumlah harus > 0", "error"); return; }
    setTxLoading(true);
    try { const res = await fetch("/api/tabungan/transaction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: selectedStudent.id, type: txType, amount: Number(txAmount), date: txDate, description: txDesc }) }); const json = await res.json(); if (json.success) { showToast(json.message); setShowTransaction(false); setSelectedStudent(null); setTxAmount(""); setTxDesc(""); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal", "error"); } finally { setTxLoading(false); }
  }

  async function openHistory(student: any) {
    setHistoryStudent(student); setShowHistory(true); setHistoryLoading(true);
    try { const res = await fetch(`/api/tabungan/${student.id}/history`); const json = await res.json(); if (json.success) { setHistoryData(json.history || []); setHistoryBalance(json.balance || 0); } } catch { showToast("Gagal memuat riwayat", "error"); } finally { setHistoryLoading(false); }
  }

  function openTransaction(student: any, type: "setor" | "tarik") { setSelectedStudent(student); setTxType(type); setTxAmount(""); setTxDesc(""); setShowTransaction(true); }

  const totalSaldo = data.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in-up">
      {toast && <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl" style={{ background: toast.type === "success" ? "#059669" : "#e11d48" }}>{toast.msg}</div>}

      {/* Hero + total saldo & filter kelas */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-500 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shrink-0"><span className="text-white"><TabunganIcon /></span></div>
              <div><h2 className="font-heading font-bold text-xl text-white m-0">Tabungan Siswa</h2><p className="text-sm text-white/70 mt-0.5">Kelola setoran & penarikan tabungan seluruh siswa aktif.</p></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">Total Saldo</p>
                <p className="font-heading text-lg font-extrabold text-white m-0">{fmtRp(totalSaldo)}</p>
              </div>
              <select value={classFilter} onChange={e => { setClassFilter(e.target.value); loadData(e.target.value); }}
                className="px-3 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-sm outline-none cursor-pointer [&>option]:text-slate-800">
                <option value="">Semua Kelas</option>
                {classrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Siswa & Saldo</h4></div>
          <Badge variant="info">{data.length} siswa</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["No", "Siswa", "Kelas", "Saldo", "Aksi"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 ? "text-center w-12" : i === 3 ? "text-right" : i === 4 ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center"><svg className="animate-spin w-6 h-6 mx-auto mb-2 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><p className="text-sm text-slate-400">Memuat...</p></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="p-16 text-center"><p className="font-heading font-bold text-slate-700">Belum Ada Data Siswa</p></td></tr>
              ) : data.map((s: any, i: number) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3.5 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center font-bold text-sm text-indigo-600 shrink-0">{(s.name || "?").charAt(0).toUpperCase()}</div>
                      <div><p className="font-semibold text-sm text-slate-800 m-0">{s.name}</p><p className="text-xs text-slate-400 mt-0.5">NISN: {s.nisn || "-"}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge variant="info">{s.classroom || "-"}</Badge></td>
                  <td className="px-4 py-3.5 text-right"><span className={`font-bold text-sm ${(s.balance || 0) > 0 ? "text-emerald-600" : "text-slate-400"}`}>{fmtRp(s.balance || 0)}</span></td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center gap-1.5">
                      <Button variant="outline" size="sm" onClick={() => openHistory(s)}>Mutasi</Button>
                      <Button variant="outline" size="sm" onClick={() => openTransaction(s, "setor")} className="!text-emerald-600 !border-emerald-200 hover:!bg-emerald-50">Setor</Button>
                      <Button variant="danger" size="sm" onClick={() => openTransaction(s, "tarik")}>Tarik</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Setor/Tarik */}
      <Modal open={showTransaction && !!selectedStudent} onClose={() => setShowTransaction(false)} title={`${txType === "setor" ? "Setor" : "Tarik"} Tabungan`} subtitle={selectedStudent ? `${selectedStudent.name} — Saldo: ${fmtRp(selectedStudent.balance || 0)}` : ""}
        footer={<><Button variant="secondary" onClick={() => setShowTransaction(false)}>Batal</Button><Button variant={txType === "setor" ? "primary" : "danger"} onClick={handleTransaction} loading={txLoading}>{txType === "setor" ? "Setor Sekarang" : "Tarik Sekarang"}</Button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah (Rp)</label><input type="number" value={txAmount} onChange={e => setTxAmount(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-200 transition-all" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal</label><input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan</label><input type="text" value={txDesc} onChange={e => setTxDesc(e.target.value)} placeholder="Opsional..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all" /></div>
          </div>
        </div>
      </Modal>

      {/* Modal Riwayat Mutasi */}
      <Modal open={showHistory && !!historyStudent} onClose={() => setShowHistory(false)} title="Riwayat Mutasi" subtitle={historyStudent ? `${historyStudent.name} — Saldo: ${fmtRp(historyBalance)}` : ""} size="lg"
        footer={<Button variant="secondary" onClick={() => setShowHistory(false)} className="w-full">Tutup</Button>}>
        <div>
          {historyLoading ? (
            <p className="text-center text-slate-400 py-8">Memuat...</p>
          ) : historyData.length === 0 ? (
            <p className="text-center text-slate-400 py-8">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {historyData.map((h: any) => (
                <div key={h.id} className={`flex items-center justify-between p-3 rounded-xl border ${h.type === "setor" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                  <div><p className="font-semibold text-sm text-slate-800 m-0">{h.type === "setor" ? "↓ Setoran" : "↑ Penarikan"}</p><p className="text-xs text-slate-500 mt-0.5">{h.date} — {h.description || "-"}</p></div>
                  <div className="text-right"><p className={`font-bold text-sm m-0 ${h.type === "setor" ? "text-emerald-600" : "text-rose-600"}`}>{h.type === "setor" ? "+" : "-"}{fmtRp(h.amount)}</p><p className="text-[10px] text-slate-400 mt-0.5">Saldo: {fmtRp(h.balanceAfter)}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
