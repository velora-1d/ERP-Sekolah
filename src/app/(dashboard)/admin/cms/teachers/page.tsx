'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { getTeachers, saveTeacher, deleteTeacher } from '@/app/actions/cms-actions';

export default function TeachersCMS() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  const fetchTeachers = async () => {
    setLoading(true);
    const data = await getTeachers();
    setTeachers(data as any[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await saveTeacher({ id: editing?.id, ...data } as any);
    setEditing(null);
    fetchTeachers();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus data guru ini?')) {
      await deleteTeacher(id);
      fetchTeachers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modul Tenaga Pengajar</h1>
          <p className="text-slate-500">Kelola daftar guru yang ditampilkan di website profil.</p>
        </div>
        <Button onClick={() => setEditing({ name: '', position: '', bio: '', status: 'aktif', order: 0 })}>
          + Tambah Guru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-4 py-20 text-center text-slate-400 italic">Memuat data guru...</div>
        ) : teachers.length === 0 ? (
          <div className="col-span-4 py-20 text-center text-slate-400 italic">Belum ada data guru.</div>
        ) : teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="aspect-square bg-slate-100 overflow-hidden relative">
              <img src={teacher.photo_url || 'https://via.placeholder.com/400'} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge variant={teacher.status === 'aktif' ? 'success' : 'neutral'}>{teacher.status}</Badge>
              </div>
            </div>
            <div className="p-5 text-center px-4">
              <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{teacher.name}</h3>
              <p className="text-indigo-600 font-semibold text-sm mb-4 line-clamp-1">{teacher.position}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditing(teacher)}
                  className="flex-1 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(teacher.id)}
                  className="px-3 py-2 bg-slate-50 text-rose-600 font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-colors text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editing.id ? 'Edit Guru' : 'Tambah Guru Baru'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <Input name="name" defaultValue={editing.name} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Jabatan</label>
                <Input name="position" defaultValue={editing.position} required placeholder="Contoh: Guru Matematika" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status Web</label>
                  <select name="status" defaultValue={editing.status} className="w-full h-11 border border-slate-300 rounded-xl px-4 outline-none">
                    <option value="aktif">Aktif (Muncul)</option>
                    <option value="nonaktif">Nonaktif (Sembunyi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Urutan Tampil</label>
                  <Input type="number" name="order" defaultValue={editing.order} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Link Foto (Opsional)</label>
                <Input name="photo_url" defaultValue={editing.photo_url} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Bio Singkat</label>
                <textarea name="bio" defaultValue={editing.bio} rows={3} className="w-full border border-slate-300 rounded-xl p-4 outline-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setEditing(null)}>Batal</Button>
                <Button type="submit">Simpan Data</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
