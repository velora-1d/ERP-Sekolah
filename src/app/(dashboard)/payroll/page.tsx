"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const PayrollIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PrintIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState("riwayat");
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [genMonth, setGenMonth] = useState((new Date().getMonth() + 1).toString());
  const [genYear, setGenYear] = useState(new Date().getFullYear().toString());
  const [employees, setEmployees] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
  const [compName, setCompName] = useState("");
  const [compType, setCompType] = useState("earning");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (activeTab === "riwayat") loadPayrolls(); if (activeTab === "atur-gaji") loadEmployees(); if (activeTab === "komponen") loadComponents(); }, [activeTab]);

  const loadPayrolls = async () => { setLoading(true); try { const res = await fetch("/api/payroll"); setPayrolls(await res.json() || []); } catch {} finally { setLoading(false); } };
  const loadEmployees = async () => { setLoading(true); try { const res = await fetch("/api/payroll/employees"); setEmployees(await res.json() || []); } catch {} finally { setLoading(false); } };
  const loadComponents = async () => { setLoading(true); try { const res = await fetch("/api/payroll/components"); setComponents(await res.json() || []); } catch {} finally { setLoading(false); } };

  const generatePayroll = async () => { Swal.fire({ title: "Generate Slip Gaji", text: `Terbitkan slip bulan ${genMonth}-${genYear}?`, icon: "question", showCancelButton: true, confirmButtonText: "Ya, Generate", cancelButtonText: "Batal", confirmButtonColor: "#3b82f6" }).then(async (r) => { if (r.isConfirmed) { Swal.fire({ title: "Memproses...", allowOutsideClick: false, didOpen: () => Swal.showLoading() }); try { const res = await fetch("/api/payroll/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month: genMonth, year: genYear }) }); const data = await res.json(); if (res.ok && data.success) { Swal.fire("Berhasil", data.message, "success"); loadPayrolls(); } else Swal.fire("Gagal", data.error || "Error", "error"); } catch { Swal.fire("Error", "Server error", "error"); } } }); };

  const deletePayroll = async (id: number) => { Swal.fire({ title: "Hapus Slip?", text: "Slip dihapus permanen.", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Hapus" }).then(async (r) => { if (r.isConfirmed) { try { const res = await fetch(`/api/payroll/${id}`, { method: "DELETE" }); const data = await res.json(); if (res.ok && data.success) { Swal.fire("Berhasil", "Slip dihapus.", "success"); loadPayrolls(); } else Swal.fire("Gagal", data.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } } }); };

  const printPayroll = async (id: number) => {
    Swal.fire({ title: "Memuat slip...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch(`/api/payroll/${id}`); const slip = await res.json(); Swal.close();
      if (slip.error) return Swal.fire("Error", slip.error, "error");
      let earnRows = ""; let dedRows = "";
      slip.components.forEach((c: any) => { const row = `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:13px;">${c.name}</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-size:13px;">Rp ${c.amount.toLocaleString("id-ID")}</td></tr>`; if (c.type === "earning") earnRows += row; else dedRows += row; });
      const html = `<div style="text-align:left;font-size:13px;"><div style="text-align:center;margin-bottom:16px;"><h3 style="margin:0;font-size:16px;">SLIP GAJI</h3><p style="margin:4px 0 0;color:#64748b;font-size:12px;">Kode: ${slip.code} | ${slip.employee_name}</p><p style="margin:2px 0 0;color:#64748b;font-size:12px;">Bulan/Tahun: ${slip.month}/${slip.year}</p></div><p style="font-weight:700;margin:12px 0 4px;">Pendapatan</p><table style="width:100%;border-collapse:collapse;">${slip.base_salary > 0 ? `<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;">Gaji Pokok</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;">Rp ${slip.base_salary.toLocaleString("id-ID")}</td></tr>` : ""}${earnRows}<tr style="background:#f0fdf4;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:700;">Total Pendapatan</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#059669;">Rp ${slip.total_earning.toLocaleString("id-ID")}</td></tr></table><p style="font-weight:700;margin:12px 0 4px;">Potongan</p><table style="width:100%;border-collapse:collapse;">${dedRows || '<tr><td style="padding:6px 12px;border:1px solid #e2e8f0;color:#94a3b8;font-style:italic;" colspan="2">- Tidak ada potongan -</td></tr>'}<tr style="background:#fef2f2;"><td style="padding:6px 12px;border:1px solid #e2e8f0;font-weight:700;">Total Potongan</td><td style="padding:6px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:700;color:#e11d48;">Rp ${slip.total_deduction.toLocaleString("id-ID")}</td></tr></table><div style="margin-top:16px;padding:12px;background:#f8fafc;border-radius:8px;text-align:center;"><span style="font-weight:800;font-size:18px;color:#1e293b;">Gaji Bersih: Rp ${slip.net_salary.toLocaleString("id-ID")}</span></div></div>`;
      Swal.fire({ title: "", html, width: 520, showCloseButton: true, confirmButtonText: "Cetak", confirmButtonColor: "#16a34a" }).then((r) => { if (r.isConfirmed) { const w = window.open("", "_blank", "width=600,height=700"); if (w) { w.document.write(`<html><head><title>Slip Gaji</title><style>body{font-family:Arial,sans-serif;padding:24px;}table{width:100%;border-collapse:collapse;}td{padding:6px 12px;border:1px solid #ccc;font-size:13px;} @media print{button{display:none;}}</style></head><body>${html}<br><button onclick="window.print()" style="padding:8px 24px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;">Print</button></body></html>`); w.document.close(); } } });
    } catch { Swal.fire("Error", "Server error", "error"); }
  };

  const setupSalary = async (empId: number, empName: string) => {
    Swal.fire({ title: "Memuat...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch(`/api/payroll/employees/${empId}/salary`); const detail = await res.json(); Swal.close();
      const comps = detail.components || [];
      let formHtml = '<div style="text-align:left;display:grid;gap:0.75rem;max-height:350px;overflow-y:auto;">';
      if (comps.length === 0) formHtml += '<p style="color:#94a3b8;font-size:0.8125rem;">Belum ada komponen gaji.</p>';
      comps.forEach((c: any, i: number) => { const color = c.type === "earning" ? "#059669" : "#e11d48"; const prefix = c.type === "earning" ? "+" : "−"; formHtml += `<div><label style="font-size:0.75rem;font-weight:600;color:${color};">${prefix} ${c.name}</label><input id="swal-sal-${i}" type="number" class="swal2-input" value="${c.amount || 0}" data-comp-id="${c.id}" style="margin:0;height:2.5rem;padding:0.5rem;display:block;width:100%;font-size:0.875rem;border:1px solid #e2e8f0;border-radius:0.5rem;outline:none;" onfocus="this.style.borderColor='#3b82f6'" onblur="this.style.borderColor='#e2e8f0'"></div>`; });
      formHtml += "</div>";
      Swal.fire({ title: "Atur Gaji: " + empName, html: formHtml, showCancelButton: true, confirmButtonText: "Simpan", cancelButtonText: "Batal", confirmButtonColor: "#3b82f6", preConfirm: () => { const result: any[] = []; comps.forEach((c: any, i: number) => { const el = document.getElementById("swal-sal-" + i) as HTMLInputElement; result.push({ component_id: c.id, amount: Number(el?.value) || 0 }); }); return result; } }).then(async (r) => { if (r.isConfirmed) { try { const saveRes = await fetch(`/api/payroll/employees/${empId}/salary`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) }); const saveData = await saveRes.json(); if (saveRes.ok && saveData.success) Swal.fire("Berhasil", "Gaji diperbarui", "success"); else Swal.fire("Gagal", saveData.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } } });
    } catch { Swal.fire("Error", "Server error", "error"); }
  };

  const addComponent = async () => { if (!compName) return Swal.fire("Error", "Nama wajib diisi", "error"); try { const res = await fetch("/api/payroll/components", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: compName, type: compType }) }); if (res.ok) { setCompName(""); loadComponents(); Swal.fire("Berhasil", "Komponen ditambahkan", "success"); } else { const data = await res.json(); Swal.fire("Gagal", data.error, "error"); } } catch { Swal.fire("Error", "Server error", "error"); } };
  const deleteComponent = async (id: number) => { Swal.fire({ title: "Hapus Komponen?", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Hapus" }).then(async (r) => { if (r.isConfirmed) { try { const res = await fetch(`/api/payroll/components/${id}`, { method: "DELETE" }); const data = await res.json(); if (res.ok && data.success) { Swal.fire("Berhasil", "Dihapus", "success"); loadComponents(); } else Swal.fire("Gagal", data.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } } }); };

  const tabs = [
    { key: "riwayat", label: "Generate & Riwayat" },
    { key: "atur-gaji", label: "Atur Gaji Pegawai" },
    { key: "komponen", label: "Master Komponen" },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Manajemen Penggajian" subtitle="Kelola komponen, atur gaji, generate slip, dan pantau riwayat." icon={<PayrollIcon />} gradient="from-sky-500 via-blue-500 to-indigo-600" />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map(t => <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === t.key ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>{t.label}</button>)}
      </div>

      {/* Panel Riwayat */}
      {activeTab === "riwayat" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-500" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Terbitkan Slip Gaji</h4></div>
            <div className="p-5 flex flex-wrap gap-3 items-end">
              <div><label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bulan</label>
                <select value={genMonth} onChange={e => setGenMonth(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 min-w-[140px] bg-white">
                  {["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].map((m,i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
                </select>
              </div>
              <div><label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tahun</label><input type="number" value={genYear} onChange={e => setGenYear(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 w-24 bg-white" /></div>
              <Button variant="primary" onClick={generatePayroll}>Generate Semua Slip</Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-500" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Log Histori</h4></div>
              <Badge variant="info">{payrolls.length} slip</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                  {["Kode / Tanggal", "Pegawai", "Gaji Bersih (THP)", "Aksi"].map((h,i) => <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={4} className="p-12 text-center text-sm text-slate-400">Memuat...</td></tr>
                  : payrolls.length === 0 ? <tr><td colSpan={4} className="p-12 text-center text-sm text-slate-400">Belum ada riwayat penggajian.</td></tr>
                  : payrolls.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3.5"><p className="text-sm font-semibold text-slate-700 m-0">{p.code}</p><p className="text-xs text-slate-400 mt-0.5">{new Date(p.created_at).toLocaleDateString("id-ID")}</p></td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{p.employee_name}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-slate-800">Rp {p.net_salary.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3.5"><div className="flex gap-1.5 justify-end">
                        <button onClick={() => printPayroll(p.id)} className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition-colors cursor-pointer"><PrintIcon /></button>
                        <button onClick={() => deletePayroll(p.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"><TrashIcon /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Panel Atur Gaji */}
      {activeTab === "atur-gaji" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-slate-100"><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Pengaturan Komponen Gaji per Pegawai</h4><p className="text-xs text-slate-400 mt-1">Nominal yang diset di sini jadi patokan saat Generate Slip Gaji.</p></div>
          <div className="p-5">
            {loading ? <p className="text-center text-sm text-slate-400">Memuat...</p>
            : employees.length === 0 ? <p className="text-center text-sm text-slate-400">Belum ada data pegawai aktif.</p>
            : <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {employees.map(e => (
                <div key={e.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div><h5 className="font-bold text-slate-800 text-sm m-0">{e.name}</h5><p className="text-xs text-slate-400 capitalize mt-0.5">{e.type === "guru" ? "Guru" : "Staff"} · {e.position || "Tanpa Posisi"}</p></div>
                  <Button variant="outline" size="sm" onClick={() => setupSalary(e.id, e.name)} className="w-full">Atur Komponen Gaji</Button>
                </div>
              ))}
            </div>}
          </div>
        </div>
      )}

      {/* Panel Komponen */}
      {activeTab === "komponen" && (
        <div className="grid md:grid-cols-3 gap-5 items-start">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-500" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Tambah Komponen</h4></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Komponen</label><input type="text" value={compName} onChange={e => setCompName(e.target.value)} placeholder="Misal: Tunjangan Makan" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 transition-all" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1.5">Jenis/Sifat</label>
                <select value={compType} onChange={e => setCompType(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 bg-white"><option value="earning">Pendapatan (+)</option><option value="deduction">Potongan (-)</option></select>
              </div>
              <Button variant="primary" onClick={addComponent} className="w-full">Simpan Komponen</Button>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Master Komponen</h4>
              <Badge variant="info">{components.length} komponen</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                  {["Nama Komponen", "Jenis", "Aksi"].map((h,i) => <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={3} className="p-12 text-center text-sm text-slate-400">Memuat...</td></tr>
                  : components.length === 0 ? <tr><td colSpan={3} className="p-12 text-center text-sm text-slate-400">Belum ada komponen.</td></tr>
                  : components.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{c.name}</td>
                      <td className="px-4 py-3.5"><Badge variant={c.type === "earning" ? "success" : "danger"} dot>{c.type === "earning" ? "Pendapatan" : "Potongan"}</Badge></td>
                      <td className="px-4 py-3.5 text-right"><button onClick={() => deleteComponent(c.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 border border-rose-200 inline-flex items-center justify-center hover:bg-rose-100 cursor-pointer transition-colors"><TrashIcon /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
