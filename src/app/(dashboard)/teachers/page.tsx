"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

const TeachersIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const DownloadIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const ExportIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;

export default function TeachersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState({ name: "", nip: "", position: "", status: "aktif" });

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teachers");
      const json = await res.json();
      if (json.success) setData(json.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeachers(); }, []);

  const filteredData = data.filter((t) => {
    const q = search.toLowerCase();
    return (t.name || "").toLowerCase().includes(q) || (t.nip || "").toLowerCase().includes(q);
  });

  function openAdd() {
    setEditTarget(null);
    setForm({ name: "", nip: "", position: "Guru Kelas", status: "aktif" });
    setModalOpen(true);
  }
  function openEdit(t: any) {
    setEditTarget(t);
    setForm({ name: t.name || "", nip: t.nip || "", position: t.position || "", status: t.status || "aktif" });
    setModalOpen(true);
  }
  async function handleSave() {
    if (!form.name.trim()) return Swal.fire("Error", "Nama wajib diisi", "error");
    try {
      if (editTarget) {
        const res = await fetch(`/api/staff/${editTarget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, type: "guru" }),
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire({ icon: "success", title: "Berhasil", text: "Data guru diperbarui", toast: true, position: "top-end", timer: 2000, showConfirmButton: false });
          setModalOpen(false);
          loadTeachers();
        } else Swal.fire("Gagal", json.message, "error");
      } else {
        const res = await fetch("/api/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, type: "guru" }),
        });
        const json = await res.json();
        if (json.success) {
          Swal.fire({ icon: "success", title: "Berhasil", text: "Data guru ditambahkan", toast: true, position: "top-end", timer: 2000, showConfirmButton: false });
          setModalOpen(false);
          loadTeachers();
        } else Swal.fire("Gagal", json.message, "error");
      }
    } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
  }

  function handleDelete(t: any) {
    Swal.fire({
      title: "Hapus Data Guru?",
      text: `Data "${t.name}" akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
    }).then(async (r) => {
      if (r.isConfirmed) {
        try {
          const res = await fetch(`/api/staff/${t.id}`, { method: "DELETE" });
          const json = await res.json();
          if (json.success) {
            Swal.fire({ icon: "success", title: "Terhapus", text: "Data guru berhasil dihapus", toast: true, position: "top-end", timer: 2000, showConfirmButton: false });
            loadTeachers();
          } else Swal.fire("Gagal", json.message, "error");
        } catch { Swal.fire("Error", "Gagal menghubungi server", "error"); }
      }
    });
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Data Guru & Tenaga Pendidik"
        subtitle="Kelola direktori tenaga pengajar secara terpusat."
        icon={<TeachersIcon />}
        gradient="from-indigo-600 via-violet-600 to-purple-600"
        actions={
          <>
            <input type="text" placeholder="Cari nama/NIP..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-sm outline-none placeholder-white/60 focus:bg-white/30 transition-colors w-44" />
            <Button variant="ghost" size="sm" icon={<DownloadIcon />} onClick={() => window.location.href = "/api/teachers/template"} className="!text-white !bg-white/10 border border-white/20 hover:!bg-white/25">Template</Button>
            <label className="cursor-pointer">
              <Button variant="ghost" size="sm" icon={<UploadIcon />} className="!text-white !bg-white/10 border border-white/20 hover:!bg-white/25 pointer-events-none">Import</Button>
              <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                const fd = new FormData(); fd.append("file", file);
                try { const res = await fetch("/api/teachers/import", { method: "POST", body: fd }); const json = await res.json(); Swal.fire(json.success ? "Berhasil" : "Gagal", json.message, json.success ? "success" : "error"); if (json.success) loadTeachers(); } catch { Swal.fire("Error", "Gagal import", "error"); }
                e.target.value = "";
              }} />
            </label>
            <Button variant="ghost" size="sm" icon={<ExportIcon />} onClick={() => window.location.href = "/api/teachers/export"} className="!text-white !bg-white/15 border border-white/25 hover:!bg-white/30">Export</Button>
            <Button variant="ghost" size="sm" icon={<PlusIcon />} onClick={openAdd} className="!text-white !bg-white/20 border border-white/30 hover:!bg-white/35 !font-bold">Tambah</Button>
          </>
        }
      />

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600" />
          <h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Guru</h4>
          <Badge variant="info" className="ml-2">{filteredData.length} guru</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                {["No", "Guru", "NIP/NUPTK", "Jabatan", "Status", "Aksi"].map((h, i) => (
                  <th key={h} className={`px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i >= 4 ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <p className="text-sm text-slate-400">Memuat data...</p>
                </td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} className="p-16 text-center">
                  <p className="font-heading font-bold text-slate-700">Belum Ada Data Guru</p>
                  <p className="text-sm text-slate-400 mt-1">Klik "Tambah" untuk menambahkan data guru.</p>
                </td></tr>
              ) : (
                filteredData.map((t, i) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                    <td className="px-5 py-4 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center font-bold text-sm text-indigo-600 shrink-0">
                          {(t.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">{t.name || "-"}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{t.gender === "L" ? "♂" : "♀"} · {t.phone || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-mono">{t.nip || "-"}</td>
                    <td className="px-5 py-4"><Badge variant="neutral">{t.position || "Guru"}</Badge></td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant={t.status === "aktif" ? "success" : "danger"} dot>{t.status || "aktif"}</Badge>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(t)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(t)}>Hapus</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit — pengganti SweetAlert form */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Data Guru" : "Tambah Guru Baru"} subtitle="Isi data guru dengan lengkap."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>{editTarget ? "Simpan Perubahan" : "Tambahkan"}</Button>
          </>
        }>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Masukkan nama lengkap"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">NIP / NUPTK</label>
            <input value={form.nip} onChange={(e) => setForm({...form, nip: e.target.value})} placeholder="Masukkan NIP atau NUPTK"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Posisi / Jabatan</label>
            <input value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} placeholder="Guru Kelas, Wali Kelas, dsb"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all" />
          </div>
          {editTarget && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all bg-white">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
