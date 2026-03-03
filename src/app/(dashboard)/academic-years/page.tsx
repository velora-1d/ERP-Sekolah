"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const CalendarIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;

export default function AcademicYearsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() { setLoading(true); try { const res = await fetch(`/api/academic-years`); const json = await res.json(); if (json.success) setData(json.data); } catch (e) { console.error(e); } finally { setLoading(false); } }
  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Tahun Ajaran" subtitle="Kelola periode tahun ajaran untuk filter & pelaporan." icon={<CalendarIcon />} gradient="from-sky-500 via-sky-400 to-sky-300" actions={<Button variant="ghost" icon={<PlusIcon />}>Tambah</Button>} />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-sky-300" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Tahun Ajaran</h4><Badge variant="info">{data.length}</Badge></div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
              {["No", "Tahun & Semester", "Status", "Aksi"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i === 2 || i === 3 ? "text-center" : "text-left"} ${i === 0 ? "w-12" : ""}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="p-12 text-center text-sm text-slate-400">Memuat...</td></tr>
              : data.length === 0 ? <tr><td colSpan={4} className="p-12 text-center"><p className="font-heading font-bold text-slate-700">Belum Ada Data</p><p className="text-sm text-slate-400 mt-1">Tambahkan tahun ajaran baru.</p></td></tr>
              : data.map((y, i) => (
                <tr key={y.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3.5 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shrink-0"><svg className="w-4.5 h-4.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                      <div><p className="font-semibold text-sm text-slate-800 m-0">{y.name || "-"}</p><p className="text-xs text-slate-400 mt-0.5">Semester {(y.semester || "ganjil").charAt(0).toUpperCase() + (y.semester || "ganjil").slice(1)}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center"><Badge variant={y.is_active ? "success" : "neutral"} dot>{y.is_active ? "Aktif" : "Nonaktif"}</Badge></td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex justify-center gap-1.5"><Button variant="outline" size="sm">Edit</Button><Button variant="danger" size="sm">Hapus</Button></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
