"use client";
import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const TagIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;

export default function TransactionCategoriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() { setLoading(true); try { const res = await fetch(`/api/transaction-categories`); const json = await res.json(); if (json.success) setData(json.data); } catch (e) { console.error(e); } finally { setLoading(false); } }
  useEffect(() => { loadData(); }, []);

  const inCats = data.filter((c: any) => c.type === "in");
  const outCats = data.filter((c: any) => c.type === "out");

  const CatTable = ({ items, type }: { items: any[]; type: "in" | "out" }) => {
    const isIn = type === "in";
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isIn ? "bg-emerald-500" : "bg-rose-500"}`} />
          <h4 className="font-heading font-bold text-sm text-slate-800 m-0">{isIn ? "Pemasukan" : "Pengeluaran"}</h4>
          <Badge variant={isIn ? "success" : "danger"}>{items.length}</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
              {["No", "Nama", "Keterangan", "Aksi"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i === 3 ? "text-center" : "text-left"} ${i === 0 ? "w-12" : i === 3 ? "w-28" : ""}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={4} className="p-8 text-center text-sm text-slate-400">Memuat...</td></tr>
              : items.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-sm text-slate-400">Belum ada kategori.</td></tr>
              : items.map((c: any, i) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3.5 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{c.name}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{c.description || "-"}</td>
                  <td className="px-4 py-3.5 text-center"><div className="flex justify-center gap-1.5"><Button variant="outline" size="sm">Edit</Button><Button variant="danger" size="sm">Hapus</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <PageHeader title="Kategori Keuangan" subtitle="Kelola kategori pemasukan & pengeluaran madrasah." icon={<TagIcon />} gradient="from-violet-600 via-purple-500 to-violet-400" actions={<Button variant="ghost" icon={<PlusIcon />}>Tambah</Button>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CatTable items={inCats} type="in" />
        <CatTable items={outCats} type="out" />
      </div>
    </div>
  );
}
