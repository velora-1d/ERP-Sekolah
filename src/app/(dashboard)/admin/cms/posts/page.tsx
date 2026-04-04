'use client';

import { useState, useEffect } from 'react';
import { getPosts, savePost, deletePost } from '@/app/actions/cms-actions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

export default function PostsCMS() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const data = await getPosts();
    setPosts(data as any[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await savePost({ id: editing?.id, ...data } as any);
    setEditing(null);
    fetchPosts();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Hapus berita ini?')) {
      await deletePost(id);
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modul Berita</h1>
          <p className="text-slate-500">Kelola artikel, berita, dan pengumuman website.</p>
        </div>
        <Button onClick={() => setEditing({ title: '', slug: '', content: '', status: 'published' })}>
          + Buat Berita Baru
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700">Judul</th>
              <th className="px-6 py-4 font-bold text-slate-700">Kategori</th>
              <th className="px-6 py-4 font-bold text-slate-700">Status</th>
              <th className="px-6 py-4 font-bold text-slate-700 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Memuat data...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Belum ada berita.</td></tr>
            ) : posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-900">{post.title}</td>
                <td className="px-6 py-4 text-slate-600">{post.category || '-'}</td>
                <td className="px-6 py-4">
                  <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                    {post.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => setEditing(post)} className="text-indigo-600 hover:text-indigo-900 font-bold">Edit</button>
                  <button onClick={() => handleDelete(post.id)} className="text-rose-600 hover:text-rose-900 font-bold">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editing.id ? 'Edit Berita' : 'Buat Berita Baru'}</h2>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-900">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Judul Berita</label>
                <Input name="title" defaultValue={editing.title} required placeholder="Contoh: Kegiatan Pondok Ramadhan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Slug (URL)</label>
                  <Input name="slug" defaultValue={editing.slug} required placeholder="kegiatan-pondok-ramadhan" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Kategori</label>
                  <select name="category" defaultValue={editing.category} className="w-full h-11 border border-slate-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Berita">Berita</option>
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Artikel">Artikel</option>
                    <option value="Kesiswaan">Kesiswaan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select name="status" defaultValue={editing.status} className="w-full h-11 border border-slate-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Thumbnail URL</label>
                  <Input name="thumbnail_url" defaultValue={editing.thumbnail_url} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Konten Berita</label>
                <textarea 
                  name="content" 
                  defaultValue={editing.content} 
                  required 
                  rows={8}
                  className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Tulis berita di sini (suport Markdown)..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setEditing(null)}>Batal</Button>
                <Button type="submit">Simpan Berita</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
