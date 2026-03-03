"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const WakafIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function WakafPage() {
  const [activeTab, setActiveTab] = useState("riwayat");
  const [data, setData] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [purposes, setPurposes] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ total: 0, monthly: 0, donorCount: 0, purposeCount: 0 });
  const [loading, setLoading] = useState(true);

  // Modal wakaf
  const [showAddWakaf, setShowAddWakaf] = useState(false);
  const [wForm, setWForm] = useState({ date: new Date().toISOString().split("T")[0], donor_id: "", purpose_id: "", amount: "" });
  const [wLoading, setWLoading] = useState(false);
  // Modal donatur
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [dForm, setDForm] = useState({ name: "", phone: "", address: "" });
  const [dLoading, setDLoading] = useState(false);
  // Modal tujuan
  const [showAddPurpose, setShowAddPurpose] = useState(false);
  const [pForm, setPForm] = useState({ name: "", description: "" });
  const [pLoading, setPLoading] = useState(false);

  useEffect(() => { if (activeTab === "riwayat") loadData(); if (activeTab === "donatur" || activeTab === "riwayat") loadDonors(); if (activeTab === "tujuan" || activeTab === "riwayat") loadPurposes(); }, [activeTab]);

  async function loadData() { setLoading(true); try { const res = await fetch("/api/wakaf"); const json = await res.json(); if (json.success) { setData(json.transactions || []); setKpi(json.kpi || { total: 0, monthly: 0, donorCount: 0, purposeCount: 0 }); } } catch (e) { console.error(e); } finally { setLoading(false); } }
  async function loadDonors() { try { const res = await fetch("/api/wakaf/donors"); const json = await res.json(); if (json.success) setDonors(json.data || []); } catch (e) { console.error(e); } }
  async function loadPurposes() { try { const res = await fetch("/api/wakaf/purposes"); const json = await res.json(); if (json.success) setPurposes(json.data || []); } catch (e) { console.error(e); } }

  const fmtRp = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

  // --- AKSI ---
  async function handleAddWakaf() {
    if (!wForm.donor_id || !wForm.purpose_id || !wForm.amount) return Swal.fire("Error", "Semua kolom wajib diisi!", "error");
    setWLoading(true);
    try { const res = await fetch("/api/wakaf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: wForm.date, donor_id: Number(wForm.donor_id), purpose_id: Number(wForm.purpose_id), amount: Number(wForm.amount) }) }); const json = await res.json(); if (res.ok && json.success) { Swal.fire({ icon: "success", title: "Berhasil", text: "Data wakaf disimpan", toast: true, position: "top-end", timer: 2000, showConfirmButton: false }); setShowAddWakaf(false); setWForm({ date: new Date().toISOString().split("T")[0], donor_id: "", purpose_id: "", amount: "" }); loadData(); } else Swal.fire("Gagal", json.error || "Gagal menyimpan", "error"); } catch { Swal.fire("Error", "Server error", "error"); } finally { setWLoading(false); }
  }

  async function handleDeleteWakaf(id: number) {
    Swal.fire({ title: "Void Transaksi?", text: "Transaksi akan divoid dan saldo kas dikembalikan.", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Void", cancelButtonText: "Batal" }).then(async (r) => {
      if (r.isConfirmed) { try { const res = await fetch(`/api/wakaf/${id}`, { method: "DELETE" }); const json = await res.json(); if (res.ok && json.success) { Swal.fire({ icon: "success", title: "Berhasil", text: "Transaksi di-void", toast: true, position: "top-end", timer: 2000, showConfirmButton: false }); loadData(); } else Swal.fire("Gagal", json.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } }
    });
  }

  async function handleAddDonor() {
    if (!dForm.name.trim()) return Swal.fire("Error", "Nama wajib diisi", "error");
    setDLoading(true);
    try { const res = await fetch("/api/wakaf/donors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dForm) }); const json = await res.json(); if (res.ok && json.success) { Swal.fire({ icon: "success", title: "Berhasil", text: "Donatur ditambahkan", toast: true, position: "top-end", timer: 2000, showConfirmButton: false }); setShowAddDonor(false); setDForm({ name: "", phone: "", address: "" }); loadDonors(); } else Swal.fire("Gagal", json.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } finally { setDLoading(false); }
  }

  async function handleAddPurpose() {
    if (!pForm.name.trim()) return Swal.fire("Error", "Nama wajib diisi", "error");
    setPLoading(true);
    try { const res = await fetch("/api/wakaf/purposes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pForm) }); const json = await res.json(); if (res.ok && json.success) { Swal.fire({ icon: "success", title: "Berhasil", text: "Tujuan ditambahkan", toast: true, position: "top-end", timer: 2000, showConfirmButton: false }); setShowAddPurpose(false); setPForm({ name: "", description: "" }); loadPurposes(); } else Swal.fire("Gagal", json.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } finally { setPLoading(false); }
  }

  async function handleDeletePurpose(id: number) {
    Swal.fire({ title: "Hapus Tujuan?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Hapus", cancelButtonText: "Batal" }).then(async (r) => {
      if (r.isConfirmed) { try { const res = await fetch(`/api/wakaf/purposes?id=${id}`, { method: "DELETE" }); const json = await res.json(); if (res.ok && json.success) { Swal.fire({ icon: "success", title: "Berhasil", text: "Dihapus", toast: true, position: "top-end", timer: 2000, showConfirmButton: false }); loadPurposes(); } else Swal.fire("Gagal", json.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } }
    });
  }

  const kpiItems = [
    { label: "Total Wakaf", value: fmtRp(kpi.total), color: "text-emerald-600" },
    { label: "Bulan Ini", value: fmtRp(kpi.monthly), color: "text-sky-600" },
    { label: "Total Donatur", value: String(kpi.donorCount), color: "text-indigo-600" },
    { label: "Program Tujuan", value: String(kpi.purposeCount), color: "text-amber-600" },
  ];

  const tabs = [
    { key: "riwayat", label: "Riwayat Wakaf" },
    { key: "donatur", label: "Daftar Donatur" },
    { key: "tujuan", label: "Tujuan / Program" },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Wakaf & Donasi" subtitle="Kelola penerimaan wakaf dan donatur madrasah." icon={<WakafIcon />} gradient="from-emerald-600 via-emerald-500 to-teal-400" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiItems.map((k, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{k.label}</p>
            <p className={`font-heading font-extrabold text-xl m-0 mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === t.key ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>{t.label}</button>
        ))}
      </div>

      {/* Panel Riwayat */}
      {activeTab === "riwayat" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Riwayat Penerimaan</h4></div>
            <Button variant="primary" size="sm" icon={<PlusIcon />} onClick={() => setShowAddWakaf(true)}>Catat Wakaf</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                  {["Tanggal", "Donatur", "Tujuan", "Nominal", "Status", "Aksi"].map((h, i) => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 3 ? "text-right" : i >= 4 ? "text-center" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-400">Memuat...</td></tr>
                : data.length === 0 ? <tr><td colSpan={6} className="p-12 text-center"><p className="font-heading font-bold text-slate-700">Belum ada transaksi</p></td></tr>
                : data.map(t => (
                  <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0 ${t.status === "void" ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{new Date(t.date).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{t.donor_name}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{t.purpose_name}</td>
                    <td className="px-4 py-3.5 text-right text-sm font-bold text-emerald-600">{fmtRp(t.amount)}</td>
                    <td className="px-4 py-3.5 text-center"><Badge variant={t.status === "void" ? "neutral" : "success"} dot>{t.status === "void" ? "VOID" : "VALID"}</Badge></td>
                    <td className="px-4 py-3.5 text-center">{t.status !== "void" && <Button variant="danger" size="sm" onClick={() => handleDeleteWakaf(t.id)}>Void</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel Donatur */}
      {activeTab === "donatur" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-500" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Donatur</h4></div>
            <Button variant="primary" size="sm" icon={<PlusIcon />} onClick={() => setShowAddDonor(true)}>Tambah Donatur</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["Nama Lengkap", "No HP", "Alamat"].map(h => <th key={h} className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {donors.length === 0 ? <tr><td colSpan={3} className="p-12 text-center text-sm text-slate-400">Belum ada donatur</td></tr> : donors.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{d.name}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{d.phone || "-"}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{d.address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Panel Tujuan */}
      {activeTab === "tujuan" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Program / Tujuan</h4></div>
            <Button variant="primary" size="sm" icon={<PlusIcon />} onClick={() => setShowAddPurpose(true)}>Tambah Tujuan</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["Nama Program", "Deskripsi", "Aksi"].map((h, i) => <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 2 ? "text-center" : "text-left"}`}>{h}</th>)}
              </tr></thead>
              <tbody>
                {purposes.length === 0 ? <tr><td colSpan={3} className="p-12 text-center text-sm text-slate-400">Belum ada tujuan wakaf</td></tr> : purposes.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{p.name}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{p.description || "-"}</td>
                    <td className="px-4 py-3.5 text-center"><button onClick={() => handleDeletePurpose(p.id)} className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"><TrashIcon /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Catat Wakaf */}
      <Modal open={showAddWakaf} onClose={() => setShowAddWakaf(false)} title="Catat Penerimaan Wakaf" subtitle="Isi data transaksi wakaf."
        footer={<><Button variant="secondary" onClick={() => setShowAddWakaf(false)}>Batal</Button><Button variant="primary" onClick={handleAddWakaf} loading={wLoading}>Simpan</Button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal</label><input type="date" value={wForm.date} onChange={e => setWForm({...wForm, date: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Donatur</label>
            <select value={wForm.donor_id} onChange={e => setWForm({...wForm, donor_id: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all bg-white">
              <option value="">— Pilih Donatur —</option>
              {donors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.phone || "-"})</option>)}
            </select>
            <p className="text-xs text-slate-400 mt-1">*Donatur baru? Tambah di tab Donatur dulu.</p>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Tujuan Wakaf</label>
            <select value={wForm.purpose_id} onChange={e => setWForm({...wForm, purpose_id: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all bg-white">
              <option value="">— Pilih Tujuan —</option>
              {purposes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Nominal (Rp)</label><input type="number" value={wForm.amount} onChange={e => setWForm({...wForm, amount: e.target.value})} placeholder="0" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 transition-all" /></div>
        </div>
      </Modal>

      {/* Modal Tambah Donatur */}
      <Modal open={showAddDonor} onClose={() => setShowAddDonor(false)} title="Tambah Donatur" subtitle="Data donatur baru."
        footer={<><Button variant="secondary" onClick={() => setShowAddDonor(false)}>Batal</Button><Button variant="primary" onClick={handleAddDonor} loading={dLoading}>Simpan</Button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label><input value={dForm.name} onChange={e => setDForm({...dForm, name: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">No HP</label><input value={dForm.phone} onChange={e => setDForm({...dForm, phone: e.target.value})} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Alamat</label><textarea value={dForm.address} onChange={e => setDForm({...dForm, address: e.target.value})} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all resize-none" /></div>
        </div>
      </Modal>

      {/* Modal Tambah Tujuan */}
      <Modal open={showAddPurpose} onClose={() => setShowAddPurpose(false)} title="Tambah Tujuan Wakaf" subtitle="Program/tujuan baru."
        footer={<><Button variant="secondary" onClick={() => setShowAddPurpose(false)}>Batal</Button><Button variant="primary" onClick={handleAddPurpose} loading={pLoading}>Simpan</Button></>}>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Program/Tujuan</label><input value={pForm.name} onChange={e => setPForm({...pForm, name: e.target.value})} placeholder="Misal: Pembangunan Masjid" className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all" /></div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Deskripsi</label><textarea value={pForm.description} onChange={e => setPForm({...pForm, description: e.target.value})} rows={3} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-200 transition-all resize-none" /></div>
        </div>
      </Modal>
    </div>
  );
}
