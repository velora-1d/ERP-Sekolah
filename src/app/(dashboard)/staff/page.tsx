"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const StaffIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const EditIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default function StaffPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadStaff = async () => { setLoading(true); try { const res = await fetch("/api/staff"); const json = await res.json(); if (json.success) setData(json.data || []); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { loadStaff(); }, []);

  const filteredData = data.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = (s.name || "").toLowerCase().includes(q) || (s.nip || "").toLowerCase().includes(q) || (s.position || "").toLowerCase().includes(q);
    return matchSearch && (statusFilter ? s.status === statusFilter : true);
  });

  const handleAdd = () => { Swal.fire({ title: "Tambah Staf", html: `<div style="text-align:left;display:grid;gap:0.75rem;"><label style="font-size:0.75rem;font-weight:600;color:#475569;">Nama</label><input id="swal-stf-name" class="swal2-input" style="margin:0;"><label style="font-size:0.75rem;font-weight:600;color:#475569;">NIK/ID</label><input id="swal-stf-nip" class="swal2-input" style="margin:0;"><label style="font-size:0.75rem;font-weight:600;color:#475569;">Jabatan</label><input id="swal-stf-pos" class="swal2-input" placeholder="Admin TU" style="margin:0;"></div>`, showCancelButton: true, confirmButtonText: "Simpan", cancelButtonText: "Batal", preConfirm: () => ({ name: (document.getElementById("swal-stf-name") as HTMLInputElement).value, nip: (document.getElementById("swal-stf-nip") as HTMLInputElement).value, position: (document.getElementById("swal-stf-pos") as HTMLInputElement).value, type: "staf", status: "aktif" }) }).then(r => { if (r.isConfirmed) Swal.fire("Berhasil", "Data staf ditambahkan. (Visual Only)", "success"); }); };

  const handleEdit = (s: any) => { Swal.fire({ title: "Edit Data Staf", html: `<div style="text-align:left;display:grid;gap:0.75rem;"><label style="font-size:0.75rem;font-weight:600;color:#475569;">Nama *</label><input id="swal-es-name" class="swal2-input" value="${s.name || ""}" style="margin:0;"><label style="font-size:0.75rem;font-weight:600;color:#475569;">NIK/ID</label><input id="swal-es-nip" class="swal2-input" value="${s.nip || ""}" style="margin:0;"><label style="font-size:0.75rem;font-weight:600;color:#475569;">Jabatan</label><input id="swal-es-pos" class="swal2-input" value="${s.position || ""}" style="margin:0;"><label style="font-size:0.75rem;font-weight:600;color:#475569;">Status</label><select id="swal-es-status" class="swal2-select" style="margin:0;"><option value="aktif" ${s.status === "aktif" ? "selected" : ""}>Aktif</option><option value="nonaktif" ${s.status !== "aktif" ? "selected" : ""}>Non-Aktif</option></select></div>`, showCancelButton: true, confirmButtonText: "Simpan", cancelButtonText: "Batal", preConfirm: () => ({ name: (document.getElementById("swal-es-name") as HTMLInputElement).value, nip: (document.getElementById("swal-es-nip") as HTMLInputElement).value, position: (document.getElementById("swal-es-pos") as HTMLInputElement).value, status: (document.getElementById("swal-es-status") as HTMLSelectElement).value }) }).then(r => { if (r.isConfirmed) Swal.fire("Berhasil", "Data staf diperbarui. (Visual Only)", "success"); }); };

  const handleDelete = (s: any) => { Swal.fire({ title: "Hapus Data Staf?", html: `<p style="font-size:0.875rem;color:#475569;">Data <strong>"${s.name}"</strong> akan dihapus.</p>`, icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Hapus", cancelButtonText: "Batal" }).then(r => { if (r.isConfirmed) Swal.fire("Berhasil", "Data staf dihapus. (Visual Only)", "success"); }); };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Data Staf & Karyawan" subtitle="Kelola direktori staf tata usaha dan karyawan secara terpusat." icon={<StaffIcon />} gradient="from-sky-500 via-blue-500 to-indigo-600" actions={<Button variant="ghost" icon={<PlusIcon />} onClick={handleAdd}>Tambah Staf</Button>} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Staf</h4><Badge variant="info">{filteredData.length} orang</Badge></div>
          <div className="flex gap-2 flex-wrap">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, NIK, jabatan..." className="px-3 py-2 text-sm border border-slate-200 rounded-xl w-52 outline-none focus:ring-2 focus:ring-blue-200" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-200">
              <option value="">Semua Status</option><option value="aktif">Aktif</option><option value="nonaktif">Non-Aktif</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
              {["No", "Profil Staf", "Jabatan", "Status", "Aksi"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 3 ? "text-center" : i === 4 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="p-12 text-center text-sm text-slate-400">Memuat data...</td></tr>
              : filteredData.length === 0 ? <tr><td colSpan={5} className="p-12 text-center"><p className="font-heading font-bold text-slate-700">Belum Ada Data Staf</p></td></tr>
              : filteredData.map((s, i) => {
                const initial = (s.name || "?").charAt(0).toUpperCase();
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3.5 text-sm text-slate-400 font-semibold">{i + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center font-bold text-sm text-sky-600 shrink-0">{initial}</div>
                        <div><p className="font-semibold text-sm text-slate-800 m-0">{s.name}</p><p className="text-xs text-slate-400 mt-0.5">NIK: {s.nip || "-"}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><Badge variant="info">{s.position || "-"}</Badge></td>
                    <td className="px-4 py-3.5 text-center"><Badge variant={s.status === "aktif" ? "success" : "neutral"} dot>{s.status === "aktif" ? "Aktif" : "Non-Aktif"}</Badge></td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => handleEdit(s)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center hover:bg-indigo-100 transition-colors cursor-pointer" title="Edit"><EditIcon /></button>
                        <button onClick={() => handleDelete(s)} className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors cursor-pointer" title="Hapus"><TrashIcon /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
