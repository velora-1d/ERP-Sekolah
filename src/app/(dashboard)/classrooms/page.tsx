"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const ClassIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;

export default function ClassroomsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() { setLoading(true); try { const res = await fetch(`/api/classrooms`); const json = await res.json(); if (json.success) setData(json.data); } catch (e) { console.error(e); } finally { setLoading(false); } }
  useEffect(() => { loadData(); }, []);
  function formatRp(n: number) { return Number(n).toLocaleString("id-ID"); }

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Ruang Kelas" subtitle="Kelola rombongan belajar tingkat 1 sampai 6." icon={<ClassIcon />} gradient="from-amber-600 via-amber-500 to-amber-400" actions={<Button variant="ghost" icon={<PlusIcon />}>Tambah Kelas</Button>} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-600 to-amber-400" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Kelas</h4><Badge variant="warning">{data.length} kelas</Badge></div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
              {["No", "Tingkat", "Nama Kelas", "Wali Kelas", "Jumlah Siswa", "Tarif Infaq", "Aksi"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i === 4 ? "text-center" : i === 5 ? "text-right" : i === 6 ? "text-center" : "text-left"} ${i === 0 ? "w-12" : ""}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="p-12 text-center text-sm text-slate-400">Memuat...</td></tr>
              : data.length === 0 ? <tr><td colSpan={7} className="p-12 text-center"><p className="font-heading font-bold text-slate-700">Belum Ada Data Kelas</p><p className="text-sm text-slate-400 mt-1">Klik "Tambah Kelas" untuk menambahkan rombel baru.</p></td></tr>
              : data.map((c: any, i) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3.5 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center font-extrabold text-lg text-amber-700 shrink-0">{c.level || "-"}</div>
                      <span className="font-semibold text-sm text-slate-800">Tingkat {c.level || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><Badge variant="info">{c.name || "-"}</Badge></td>
                  <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{c.wali_kelas || <span className="text-slate-400">Belum ada</span>}</td>
                  <td className="px-4 py-3.5 text-center"><span className="font-bold text-sm text-slate-800">{c.student_count || 0}</span> <span className="text-xs text-slate-400">siswa</span></td>
                  <td className="px-4 py-3.5 text-right font-bold text-sm text-emerald-600">Rp {formatRp(c.infaq_nominal || 0)}</td>
                  <td className="px-4 py-3.5 text-center"><Button variant="outline" size="sm">Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
