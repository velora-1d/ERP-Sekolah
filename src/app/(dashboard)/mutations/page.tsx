"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const MutationIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;

export default function MutationsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [action, setAction] = useState("pindah_kelas");
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => { loadClassrooms(); }, []);
  useEffect(() => { if (selectedClass) loadStudents(selectedClass); else setStudents([]); setSelected([]); }, [selectedClass]);

  const loadClassrooms = async () => { try { const res = await fetch("/api/classrooms"); const json = await res.json(); if (json.success) setClassrooms(json.data || []); } catch (e) { console.error(e); } };
  const loadStudents = async (classId: string) => { setLoading(true); try { const res = await fetch(`/api/students?classroom=${classId}`); const json = await res.json(); if (json.success) setStudents(json.data || []); } catch (e) { console.error(e); } finally { setLoading(false); } };

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => { if (selected.length === students.length) setSelected([]); else setSelected(students.map(s => s.id)); };

  const handleExecute = async () => {
    if (selected.length === 0) return Swal.fire("Peringatan", "Pilih minimal 1 siswa", "warning");
    if (action === "pindah_kelas" && !targetClass) return Swal.fire("Peringatan", "Pilih kelas tujuan", "warning");
    const labels: Record<string, string> = { pindah_kelas: "Pindah Kelas", lulus: "Kelulusan", pindah: "Pindah Sekolah", nonaktif: "Non-aktifkan" };
    const r = await Swal.fire({ title: `Konfirmasi ${labels[action]}`, text: `${selected.length} siswa akan diproses.`, icon: "question", showCancelButton: true, confirmButtonText: "Ya, Proses", cancelButtonText: "Batal", confirmButtonColor: "#4f46e5" });
    if (!r.isConfirmed) return;
    setExecuting(true);
    try { const res = await fetch("/api/mutations/execute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentIds: selected, action, targetClassroomId: action === "pindah_kelas" ? Number(targetClass) : undefined }) }); const json = await res.json(); if (json.success) { Swal.fire("Berhasil", json.message, "success"); setSelected([]); if (selectedClass) loadStudents(selectedClass); } else Swal.fire("Gagal", json.message, "error"); } catch { Swal.fire("Error", "Server error", "error"); } finally { setExecuting(false); }
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Mutasi Siswa" subtitle="Pindah kelas, kelulusan, atau perubahan status siswa." icon={<MutationIcon />} gradient="from-red-600 via-rose-500 to-red-400" />

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div><label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Kelas Asal</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
              <option value="">— Pilih Kelas —</option>{classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Aksi Mutasi</label>
            <select value={action} onChange={e => setAction(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
              <option value="pindah_kelas">Pindah Kelas</option><option value="lulus">Kelulusan</option><option value="pindah">Pindah Sekolah</option><option value="nonaktif">Non-aktifkan</option>
            </select>
          </div>
          {action === "pindah_kelas" && (
            <div><label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Kelas Tujuan</label>
              <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
                <option value="">— Pilih —</option>{classrooms.filter(c => c.id.toString() !== selectedClass).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-end"><Button variant="danger" onClick={handleExecute} disabled={executing || selected.length === 0} className="w-full">{executing ? "Memproses..." : `Eksekusi (${selected.length} siswa)`}</Button></div>
        </div>
      </div>

      {/* Tabel Siswa */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-500 to-rose-500" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Siswa {selectedClass ? "" : "(Pilih Kelas Dahulu)"}</h4></div>
          {students.length > 0 && <button onClick={toggleAll} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">{selected.length === students.length ? "Batal Semua" : "Pilih Semua"}</button>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
              {["✓", "NISN", "Nama Siswa", "JK", "Status"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i === 3 || i === 4 ? "text-center" : "text-left"} ${i === 0 ? "w-12" : ""}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {!selectedClass ? <tr><td colSpan={5} className="p-12 text-center text-sm text-slate-400">Pilih kelas asal untuk melihat daftar siswa.</td></tr>
              : loading ? <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-400">Memuat...</td></tr>
              : students.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-sm text-slate-400">Tidak ada siswa di kelas ini.</td></tr>
              : students.map(s => (
                <tr key={s.id} onClick={() => toggleSelect(s.id)} className={`border-b border-slate-100 cursor-pointer transition-colors ${selected.includes(s.id) ? "bg-indigo-50" : "hover:bg-slate-50/80"}`}>
                  <td className="px-4 py-3.5 text-center"><input type="checkbox" checked={selected.includes(s.id)} readOnly className="w-4 h-4 accent-indigo-600" /></td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{s.nisn || "-"}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{s.name}</td>
                  <td className="px-4 py-3.5 text-center"><Badge variant={s.gender === "L" ? "info" : "warning"}>{s.gender}</Badge></td>
                  <td className="px-4 py-3.5 text-center"><Badge variant="success" dot>{s.status || "aktif"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
