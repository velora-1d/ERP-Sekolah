'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { getFacilities, saveFacility, deleteFacility } from '@/app/actions/cms-actions';

export default function FacilitiesCMS() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  const fetchFacilities = async () => {
    setLoading(true);
    const data = await getFacilities();
    setFacilities(data as any[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await saveFacility({ id: editing?.id, ...data } as any);
    setEditing(null);
    fetchFacilities();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus fasilitas ini?')) {
      await deleteFacility(id);
      fetchFacilities();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modul Fasilitas Sekolah</h1>
          <p className="text-slate-500">Kelola daftar fasilitas yang dimiliki sekolah.</p>
        </div>
        <Button onClick={() => setEditing({ name: '', description: '', icon: '', status: 'aktif', order: 0 })}>
          + Tambah Fasilitas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-20 text-center text-slate-400 italic">Memuat data fasilitas...</div>
        ) : facilities.length === 0 ? (
          <div className="col-span-3 py-20 text-center text-slate-400 italic">Belum ada data fasilitas.</div>
        ) : facilities.map((fac) => (
          <div key={fac.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="h-48 bg-slate-100 overflow-hidden relative">
              <img src={fac.image_url || 'https://via.placeholder.com/600x400'} alt={fac.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute top-4 left-4">
                <Badge variant={fac.status === 'aktif' ? 'success' : 'neutral'}>{fac.status}</Badge>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-slate-900">{fac.name}</h3>
                <span className="text-sm font-bold text-slate-400">#{fac.order}</span>
              </div>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">{fac.description}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditing(fac)}
                  className="flex-1 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(fac.id)}
                  className="px-4 py-2 bg-slate-50 text-rose-600 font-bold rounded-xl hover:bg-rose-600 hover:text-white transition-colors"
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
              <h2 className="text-xl font-bold">{editing.id ? 'Edit Fasilitas' : 'Tambah Fasilitas'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nama Fasilitas</label>
                <Input name="name" defaultValue={editing.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={editing.status} className="w-full h-11 border border-slate-300 rounded-xl px-4 outline-none">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Urutan</label>
                  <Input type="number" name="order" defaultValue={editing.order} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Link Gambar</label>
                <Input name="image_url" defaultValue={editing.image_url} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                <textarea name="description" defaultValue={editing.description} rows={3} className="w-full border border-slate-300 rounded-xl p-4 outline-none" required />
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
