"use client";
import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const PpdbIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const ExportIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

export default function PpdbPage() {
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [showConvert, setShowConvert] = useState(false);
  const [convertReg, setConvertReg] = useState<any>(null);
  const [convertClassroom, setConvertClassroom] = useState("");
  const [convertInfaq, setConvertInfaq] = useState("");
  const [convertLoading, setConvertLoading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);

  const showToast = (msg: string, type: "success" | "error" = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const loadData = useCallback(async (q = search) => {
    setLoading(true);
    try { const res = await fetch(`/api/ppdb?q=${encodeURIComponent(q)}`); const json = await res.json(); if (json.success) { setData(json.data); setStats(json.stats); } } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [search]);

  async function loadClassrooms() {
    try { const res = await fetch("/api/classrooms"); const json = await res.json(); if (json.success) setClassrooms(json.data); } catch (e) { console.error(e); }
  }

  useEffect(() => { loadData(); loadClassrooms(); }, []);

  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) { const q = e.target.value; setSearch(q); clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadData(q), 400); }

  async function handleApprove(reg: any) { if (!confirm(`Terima ${reg.name}?`)) return; try { const res = await fetch(`/api/ppdb/${reg.id}/approve`, { method: "POST" }); const json = await res.json(); if (json.success) { showToast(json.message); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal", "error"); } }
  async function handleReject(reg: any) { if (!confirm(`Tolak ${reg.name}?`)) return; try { const res = await fetch(`/api/ppdb/${reg.id}/reject`, { method: "POST" }); const json = await res.json(); if (json.success) { showToast(json.message); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal", "error"); } }
  function openConvert(reg: any) { setConvertReg(reg); setConvertClassroom(""); setConvertInfaq(""); setShowConvert(true); }

  async function handleConvert() {
    if (!convertReg) return; setConvertLoading(true);
    try { const res = await fetch(`/api/ppdb/${convertReg.id}/convert`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classroomId: convertClassroom ? Number(convertClassroom) : undefined, infaqNominal: convertInfaq ? Number(convertInfaq) : 0 }) }); const json = await res.json(); if (json.success) { showToast(json.message); setShowConvert(false); loadData(); } else showToast(json.message, "error"); } catch { showToast("Gagal konversi", "error"); } finally { setConvertLoading(false); }
  }

  async function handleTogglePayment(paymentId: number, paymentType: string) {
    try { const res = await fetch(`/api/quick-payment/${paymentId}/toggle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }); const json = await res.json(); if (json.success) { showToast(json.message); loadData(); } else showToast(json.message, "error"); } catch { showToast(`Gagal toggle ${paymentType}`, "error"); }
  }

  const filtered = statusFilter ? data.filter(d => d.status === statusFilter) : data;

  const statusMap: Record<string, { variant: "warning" | "success" | "danger" | "info" | "neutral"; label: string }> = {
    menunggu: { variant: "warning", label: "⏳ Menunggu" }, pending: { variant: "warning", label: "⏳ Pending" },
    diterima: { variant: "success", label: "✓ Diterima" }, ditolak: { variant: "danger", label: "✗ Ditolak" },
    converted: { variant: "info", label: "⇌ Siswa" },
  };

  const kpiItems = stats ? [
    { label: "Total", value: stats.total, bg: "bg-white/10 border-white/20" },
    { label: "Menunggu", value: stats.pending, bg: "bg-amber-400/20 border-amber-400/30" },
    { label: "Diterima", value: stats.diterima, bg: "bg-emerald-500/20 border-emerald-400/30" },
    { label: "Ditolak", value: stats.ditolak, bg: "bg-rose-500/20 border-rose-400/30" },
  ] : [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {toast && <div className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl animate-fade-in" style={{ background: toast.type === "success" ? "#059669" : "#e11d48" }}>{toast.msg}</div>}

      {/* Hero + KPI */}
      <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-24 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="p-7 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-sm shrink-0"><span className="text-white"><PpdbIcon /></span></div>
              <div><h2 className="font-heading font-bold text-2xl text-white m-0 tracking-tight">Penerimaan Siswa Baru (PPDB)</h2><p className="text-sm text-white/75 mt-1">Kelola pendaftaran, penerimaan, dan konversi ke siswa.</p></div>
            </div>
            <Button variant="ghost" size="sm" icon={<ExportIcon />} onClick={() => window.location.href = "/api/ppdb/export"} className="!text-white !bg-white/15 border border-white/25 hover:!bg-white/30">Export</Button>
          </div>
          {kpiItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpiItems.map((k, i) => (
                <div key={i} className={`${k.bg} backdrop-blur-xl border rounded-xl p-4`}>
                  <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">{k.label}</p>
                  <p className="font-heading text-2xl font-extrabold text-white m-0">{k.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Cari Nama</label>
            <input type="text" value={search} onChange={handleSearch} placeholder="Ketik nama..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all" />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all bg-white">
              <option value="">Semua</option>
              <option value="menunggu">Menunggu</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-sky-700" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Pendaftar</h4></div>
          <Badge variant="info">{filtered.length} data</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["No", "No. Reg", "Nama Calon Siswa", "L/P", "Pembayaran", "Status", "Aksi"].map((h, i) => (
                  <th key={h} className={`px-4 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i >= 3 ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-12 text-center"><svg className="animate-spin w-6 h-6 mx-auto mb-2 text-sky-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><p className="text-sm text-slate-400">Memuat...</p></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-16 text-center"><p className="font-heading font-bold text-slate-700">Belum Ada Pendaftar</p></td></tr>
              ) : filtered.map((reg: any, i: number) => {
                const s = reg.status;
                const sm = statusMap[s] || { variant: "neutral" as const, label: s };
                return (
                  <tr key={reg.id} className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0 ${s === "ditolak" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-4 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-sky-600">{reg.formNo || `#${reg.id}`}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-sm text-slate-800 m-0">{reg.name || "-"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{reg.fatherName || reg.motherName || "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-center"><Badge variant={reg.gender === "L" ? "info" : "danger"}>{reg.gender === "L" ? "Putra" : "Putri"}</Badge></td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex gap-1 justify-center flex-wrap">
                        {(reg.payments && reg.payments.length > 0) ? reg.payments.map((p: any) => (
                          <button key={p.id} onClick={() => handleTogglePayment(p.id, p.paymentType)} title={`${p.paymentType}: Rp ${Number(p.nominal).toLocaleString("id-ID")}`}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border-none cursor-pointer transition-colors ${p.isPaid ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}>
                            {p.isPaid ? "✓" : "○"} {p.paymentType}
                          </button>
                        )) : <span className="text-xs text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center"><Badge variant={sm.variant} dot>{sm.label}</Badge></td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-1.5 flex-wrap">
                        {(s === "menunggu" || s === "pending") && <>
                          <Button variant="outline" size="sm" onClick={() => handleApprove(reg)} className="!text-emerald-600 !border-emerald-200 hover:!bg-emerald-50">Terima</Button>
                          <Button variant="danger" size="sm" onClick={() => handleReject(reg)}>Tolak</Button>
                        </>}
                        {s === "diterima" && <Button variant="primary" size="sm" onClick={() => openConvert(reg)}>Konversi</Button>}
                        {s === "converted" && <span className="text-xs text-indigo-400 font-semibold">Sudah Siswa</span>}
                        {s === "ditolak" && <span className="text-xs text-slate-300">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Konversi */}
      <Modal open={showConvert && !!convertReg} onClose={() => setShowConvert(false)} title="Konversi ke Siswa" subtitle={convertReg ? `${convertReg.name} akan dijadikan siswa aktif.` : ""}
        footer={<><Button variant="secondary" onClick={() => setShowConvert(false)}>Batal</Button><Button variant="primary" onClick={handleConvert} loading={convertLoading}>Konversi Sekarang</Button></>}>
        <div className="space-y-4">
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-200">
            <p className="text-xs text-sky-700">📋 Data NISN, NIK, nama ortu, dan alamat akan otomatis disalin dari formulir PPDB.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kelas Tujuan</label>
            <select value={convertClassroom} onChange={e => setConvertClassroom(e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all bg-white">
              <option value="">— Belum Ditentukan —</option>
              {classrooms.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nominal Infaq/SPP Bulanan (Rp)</label>
            <input type="number" value={convertInfaq} onChange={e => setConvertInfaq(e.target.value)} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
