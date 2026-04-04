"use client";

import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Pagination from "@/components/Pagination";
import FilterBar from "@/components/FilterBar";
import { useSearchParams } from "next/navigation";
import { 
  createCurriculum, 
  resetCurriculum, 
  deleteGradeComponent, 
  saveKkmValue 
} from "@/app/actions/curriculum-actions";
import { Trash, Plus, Save, BookOpen as BookOpenIcon } from "lucide-react";

const BookOpen = ({ className }: { className?: string }) => (
  <BookOpenIcon className={className} />
);

interface Curriculum {
  id: number;
  type: string;
  academicYearId: number;
  semester: string;
  isLocked: boolean;
}

interface GradeComponent {
  id: number;
  name: string;
  code: string;
  bobot: number;
  urutan: number;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

export default function CurriculumPage() {
  const searchParams = useSearchParams();
  const selectedYearId = searchParams.get("academicYearId") || "";
  const semester = searchParams.get("semester") || "ganjil";

  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [newComp, setNewComp] = useState({ name: "", code: "", bobot: 0 });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [kkmData, setKkmData] = useState<Record<number, { nilai: number; deskripsi: string; saving?: boolean }>>({});

  // Pagination states
  const [subPage, setSubPage] = useState(1);
  const [subPagination, setSubPagination] = useState({ total: 0, totalPages: 1 });
  const [compPage, setCompPage] = useState(1);
  const [compPagination, setCompPagination] = useState({ total: 0, totalPages: 1 });

  const loadKkm = useCallback(async (curriculumId: number) => {
    try {
      const res = await fetch(`/api/grades/kkm?curriculumId=${curriculumId}&limit=1000`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped: Record<number, { nilai: number; deskripsi: string }> = {};
        interface KkmItem {
          subjectId: number;
          nilaiKKM: number;
          deskripsiKKTP: string;
        }
        json.data.forEach((k: KkmItem) => {
          mapped[k.subjectId] = { nilai: k.nilaiKKM, deskripsi: k.deskripsiKKTP };
        });
        setKkmData(mapped);
      }
    } catch (error) { console.error(error); }
  }, []);

  const loadCurriculum = useCallback(async () => {
    if (!selectedYearId || !semester) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/curriculum?academicYearId=${selectedYearId}&semester=${semester}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      if (list.length > 0) {
        setCurriculum(list[0]);
        loadKkm(list[0].id);
      } else {
        setCurriculum(null);
        setComponents([]);
        setKkmData({});
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [selectedYearId, semester, loadKkm]);

  const loadComponents = useCallback(async () => {
    if (!curriculum) return;
    try {
      const res = await fetch(`/api/grades/components?curriculumId=${curriculum.id}&page=${compPage}&limit=5`);
      const json = await res.json();
      if (json.success) {
        setComponents(json.data);
        setCompPagination({ total: json.total, totalPages: json.totalPages });
      }
    } catch (e) { console.error(e); }
  }, [curriculum, compPage]);

  const loadSubjects = useCallback(async () => {
    try {
      const res = await fetch(`/api/subjects?page=${subPage}&limit=10`);
      const json = await res.json();
      if (json.success) {
        setSubjects(json.data);
        setSubPagination({ total: json.pagination.total, totalPages: json.pagination.totalPages });
      }
    } catch (e) { console.error(e); }
  }, [subPage]);

  useEffect(() => { loadCurriculum(); }, [loadCurriculum]);
  useEffect(() => { loadComponents(); }, [loadComponents]);
  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const handleCreate = async (type: string) => {
    const res = await createCurriculum({ 
      type, 
      academicYearId: Number(selectedYearId), 
      semester 
    });
    if (res.success) {
      Swal.fire("Berhasil", "Kurikulum telah dibuat", "success");
      await loadCurriculum();
    } else {
      Swal.fire("Gagal", res.error, "error");
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset Kurikulum?",
      text: "Seluruh komponen nilai dan KKM akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Reset Semua",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed && curriculum) {
      const res = await resetCurriculum(curriculum.id);
      if (res.success) {
        Swal.fire("Dihapus", "Kurikulum telah direset", "success");
        await loadCurriculum();
      }
    }
  };

  const handleAddComponent = async () => {
    if (!curriculum) return;
    const res = await fetch("/api/grades/components", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curriculumId: curriculum.id,
        ...newComp,
        urutan: compPagination.total + 1
      }),
    });
    if (res.ok) {
      setNewComp({ name: "", code: "", bobot: 0 });
      await loadComponents();
      Swal.fire({ title: "Berhasil", text: "Komponen ditambahkan", icon: "success", toast: true, position: "top-end", showConfirmButton: false, timer: 2000 });
    }
  };

  const handleDeleteComponent = async (id: number) => {
    const res = await deleteGradeComponent(id);
    if (res.success) {
      await loadComponents();
      Swal.fire({ title: "Terhapus", icon: "success", toast: true, position: "top-end", showConfirmButton: false, timer: 2000 });
    }
  };

  const handleSaveKkm = async (subId: number) => {
    const data = kkmData[subId];
    if (!data || !curriculum) return;
    
    setKkmData(prev => ({ ...prev, [subId]: { ...prev[subId], saving: true } }));
    const res = await saveKkmValue(curriculum.id, subId, data.nilai, data.deskripsi);
    setKkmData(prev => ({ ...prev, [subId]: { ...prev[subId], saving: false } }));
    
    if (res.success) {
      Swal.fire({ title: "KKM Tersimpan", icon: "success", toast: true, position: "top-end", showConfirmButton: false, timer: 1500 });
    }
  };

  const totalBobot = components.reduce((acc, c) => acc + c.bobot, 0);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Manajemen Kurikulum"
        subtitle="Konfigurasi standar penilaian dan KKM per periode"
        icon={<BookOpen className="w-5 h-5 text-white" />}
      />

      <FilterBar visibleFilters={["academicYear", "semester"]} />

      {loading ? (
        <Card className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">Memuat data kurikulum...</p>
        </Card>
      ) : curriculum ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none shadow-xl shadow-indigo-500/5 bg-linear-to-br from-white to-indigo-50/30">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 tracking-tight">Info Kurikulum</h3>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${curriculum.isLocked ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {curriculum.isLocked ? "Locked" : "Active"}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center bg-white/60 p-3 rounded-2xl border border-white">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 mr-3">
                      <span className="text-white font-bold text-xs">{curriculum.type.slice(0, 3)}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Standardisasi</p>
                      <p className="font-bold text-slate-800">{curriculum.type === "KURMER" ? "Kurikulum Merdeka" : curriculum.type === "K13" ? "Kurikulum 2013" : "Kurikulum Kustom"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/60 p-4 rounded-3xl border border-white shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 label-spacing">Semester</p>
                      <p className="font-black text-slate-800 capitalize text-sm">{curriculum.semester}</p>
                    </div>
                    <div className="bg-white/60 p-4 rounded-3xl border border-white shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 label-spacing">Tahun</p>
                      <p className="font-black text-slate-800 italic text-sm">2025/2026</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col gap-3">
                   <button 
                    onClick={handleReset}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white text-rose-600 font-black text-[11px] uppercase tracking-widest border border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2 shadow-sm"
                   >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                    Reset Kurikulum
                   </button>
                   <p className="text-[10px] text-slate-400 text-center font-bold italic px-6 leading-relaxed opacity-60">Mengatur ulang kurikulum akan menghapus semua konfigurasi pada periode ini secara permanen.</p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-none shadow-xl shadow-slate-500/5">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 tracking-tight">Komponen Nilai</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${totalBobot === 100 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    Total: {totalBobot}%
                  </div>
                </div>

                <div className="space-y-4">
                  {components.map((c) => (
                    <div key={c.id} className="group flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-100">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-[11px] text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                          {c.code}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight mb-0.5">{c.name}</p>
                          <div className="flex items-center gap-2">
                             <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.bobot}%` }}></div>
                             </div>
                             <p className="text-[11px] text-slate-400 font-black tracking-tight">{c.bobot}%</p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteComponent(c.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-500 bg-transparent hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="py-2 border-t border-slate-100 flex justify-center">
                    <Pagination page={compPage} totalPages={compPagination.totalPages} total={compPagination.total} onPageChange={setCompPage} />
                  </div>

                  {!curriculum.isLocked && (
                    <div className="mt-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 space-y-3">
                      <input 
                        type="text" placeholder="Nama Komponen (E.g. Sumatif Akhir)" 
                        className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})}
                      />
                      <div className="flex gap-2">
                        <input 
                          type="text" placeholder="Kode" 
                          className="flex-1 bg-white border-none rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          value={newComp.code} onChange={e => setNewComp({...newComp, code: e.target.value})}
                        />
                        <input 
                          type="number" placeholder="%" 
                          className="w-20 bg-white border-none rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          value={newComp.bobot || ""} onChange={e => setNewComp({...newComp, bobot: Number(e.target.value)})}
                        />
                      </div>
                      <button 
                        onClick={handleAddComponent}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                      >
                        + Tambah Komponen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="border-none shadow-xl shadow-slate-500/5 overflow-hidden" noPadding>
              <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 tracking-tight">Kriteria Ketuntasan (KKM/KKTP)</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Atur standar nilai minimal per mata pelajaran</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] border-b border-slate-100">
                      <th className="px-8 py-5">Mata Pelajaran</th>
                      <th className="px-8 py-5 w-40 text-center">Nilai Minimal</th>
                      <th className="px-8 py-5">Deskripsi KKTP / Target Capaian</th>
                      <th className="px-8 py-5 w-32 text-center text-indigo-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {subjects.map((sub) => {
                      const d = kkmData[sub.id] || { nilai: 75, deskripsi: "", saving: false };
                      return (
                        <tr key={sub.id} className="group hover:bg-indigo-50/20 transition-all">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-700">{sub.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{sub.code}</p>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <input 
                              type="number" className="w-24 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-sm font-black text-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-center shadow-inner"
                              value={d.nilai} onChange={e => setKkmData({...kkmData, [sub.id]: {...d, nilai: Number(e.target.value)}})}
                              disabled={curriculum.isLocked}
                            />
                          </td>
                          <td className="px-8 py-5">
                            <textarea 
                              rows={1} placeholder="Input capaian target..."
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-600 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none shadow-inner"
                              value={d.deskripsi} onChange={e => setKkmData({...kkmData, [sub.id]: {...d, deskripsi: e.target.value}})}
                              disabled={curriculum.isLocked}
                            />
                          </td>
                          <td className="px-8 py-5 text-center">
                            <button 
                              onClick={() => handleSaveKkm(sub.id)}
                              disabled={curriculum.isLocked || d.saving}
                              className={`group relative flex items-center justify-center mx-auto w-12 h-12 rounded-2xl transition-all ${
                                d.saving ? "bg-slate-100 text-slate-400" : "bg-white text-indigo-600 border border-slate-100 hover:bg-indigo-600 hover:text-white hover:shadow-xl hover:shadow-indigo-200"
                              }`}
                            >
                              {d.saving ? (
                                <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin"></div>
                              ) : (
                                <Save className="w-5 h-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-slate-50/30 border-t border-slate-100">
                <Pagination page={subPage} totalPages={subPagination.totalPages} total={subPagination.total} onPageChange={setSubPage} />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 px-6 border-slate-100 shadow-2xl shadow-indigo-500/10 bg-linear-to-b from-white to-slate-50/50 rounded-5xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-blue-500 to-violet-500 opacity-20"></div>
          
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-indigo-500/15 blur-3xl rounded-full"></div>
            <div className="relative w-28 h-28 bg-indigo-50 rounded-4xl flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100">
               <BookOpenIcon className="w-12 h-12" />
            </div>
          </div>

          <div className="text-center space-y-4 max-w-xl">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">Setup Kurikulum</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mx-auto max-w-md">
              Tahun ajaran ini belum memiliki konfigurasi kurikulum. <br />
              Pilih standar kurikulum di bawah ini untuk memulai.
            </p>
          </div>
          
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
            <button 
              onClick={() => handleCreate("KURMER")}
              className="group relative p-6 rounded-4xl bg-white border border-slate-100 shadow-2xl shadow-indigo-500/5 hover:border-indigo-500 hover:-translate-y-2 transition-all text-left overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full group-hover:bg-indigo-600/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-5 transition-all shadow-inner">
                  <span className="font-black text-sm">KM</span>
                </div>
                <p className="font-black text-lg text-slate-800 leading-tight">Kurikulum Merdeka</p>
                <p className="text-[11px] text-slate-400 font-bold tracking-tight mt-2 uppercase">Standardisasi 2022/2024</p>
                <div className="mt-6 flex items-center text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">
                  Pilih <Plus className="ml-1 w-3 h-3" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleCreate("K13")}
              className="group relative p-6 rounded-4xl bg-white border border-slate-100 shadow-2xl shadow-blue-500/5 hover:border-blue-500 hover:-translate-y-2 transition-all text-left overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full group-hover:bg-blue-600/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center mb-5 transition-all shadow-inner">
                  <span className="font-black text-sm">K13</span>
                </div>
                <p className="font-black text-lg text-slate-800 leading-tight">Kurikulum 2013</p>
                <p className="text-[11px] text-slate-400 font-bold tracking-tight mt-2 uppercase">Revisi Terakhir</p>
                <div className="mt-6 flex items-center text-blue-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">
                  Pilih <Plus className="ml-1 w-3 h-3" />
                </div>
              </div>
            </button>

            <button 
              onClick={() => handleCreate("CUSTOM")}
              className="group relative p-6 rounded-4xl bg-white border border-slate-100 shadow-2xl shadow-violet-500/5 hover:border-violet-500 hover:-translate-y-2 transition-all text-left overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-50 rounded-full group-hover:bg-violet-600/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 group-hover:bg-violet-600 text-violet-600 group-hover:text-white flex items-center justify-center mb-5 transition-all shadow-inner">
                  <span className="font-black text-sm">CP</span>
                </div>
                <p className="font-black text-lg text-slate-800 leading-tight">Kurikulum Kustom</p>
                <p className="text-[11px] text-slate-400 font-bold tracking-tight mt-2 uppercase">Fleksibel & Mandiri</p>
                <div className="mt-6 flex items-center text-violet-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all">
                  Pilih <Plus className="ml-1 w-3 h-3" />
                </div>
              </div>
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
