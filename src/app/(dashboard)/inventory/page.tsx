"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const BoxIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const PlusIcon = () => <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>;

export default function InventoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");

  const loadInventory = async () => { setLoading(true); try { const res = await fetch("/api/inventory"); setData(await res.json() || []); } catch (e) { console.error(e); } finally { setLoading(false); } };
  useEffect(() => { loadInventory(); }, []);

  const filteredData = data.filter(item => {
    const q = search.toLowerCase();
    const matchSearch = (item.name || "").toLowerCase().includes(q) || (item.category || "").toLowerCase().includes(q) || (item.location || "").toLowerCase().includes(q);
    return matchSearch && (conditionFilter ? item.condition === conditionFilter : true);
  });
  const totalValue = filteredData.reduce((acc, val) => acc + (val.quantity || 0) * (val.acquisitionCost || 0), 0);

  const handleAdd = () => { Swal.fire({ title: "Tambah Aset", html: `<div style="text-align:left;display:grid;gap:0.75rem;"><div><label style="font-size:0.75rem;font-weight:600;">Nama Barang</label><input id="swal-inv-name" class="swal2-input" style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Kategori</label><input id="swal-inv-cat" class="swal2-input" placeholder="Mebel, Elektronik..." style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Jumlah</label><input id="swal-inv-qty" type="number" class="swal2-input" value="1" style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Kondisi</label><select id="swal-inv-cond" class="swal2-select" style="margin:0;height:2.5rem;font-size:0.875rem;width:100%;padding:0 0.5rem;"><option value="Baik">Baik</option><option value="Rusak Ringan">Rusak Ringan</option><option value="Rusak Berat">Rusak Berat</option></select></div><div><label style="font-size:0.75rem;font-weight:600;">Lokasi</label><input id="swal-inv-loc" class="swal2-input" placeholder="Ruang Kelas 1" style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Harga Perolehan</label><input id="swal-inv-cost" type="number" class="swal2-input" value="0" style="margin:0;height:2.5rem;font-size:0.875rem;"></div></div>`, showCancelButton: true, confirmButtonText: "Simpan", cancelButtonText: "Batal", confirmButtonColor: "#3b82f6", preConfirm: () => ({ name: (document.getElementById("swal-inv-name") as HTMLInputElement).value, category: (document.getElementById("swal-inv-cat") as HTMLInputElement).value, quantity: parseInt((document.getElementById("swal-inv-qty") as HTMLInputElement).value) || 1, condition: (document.getElementById("swal-inv-cond") as HTMLSelectElement).value, location: (document.getElementById("swal-inv-loc") as HTMLInputElement).value, acquisitionCost: parseInt((document.getElementById("swal-inv-cost") as HTMLInputElement).value) || 0 }) }).then(async r => { if (r.isConfirmed) { try { const res = await fetch("/api/inventory", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) }); if (res.ok) { Swal.fire("Berhasil", "Aset ditambahkan.", "success"); loadInventory(); } else { const d = await res.json(); Swal.fire("Gagal", d.error, "error"); } } catch { Swal.fire("Error", "Server error", "error"); } } }); };

  const handleEdit = async (id: number) => { Swal.fire({ title: "Memuat...", didOpen: () => Swal.showLoading() }); try { const res = await fetch(`/api/inventory/${id}`); const item = await res.json(); Swal.close(); if (item.error) return Swal.fire("Error", item.error, "error"); Swal.fire({ title: "Edit Aset", html: `<div style="text-align:left;display:grid;gap:0.75rem;"><div><label style="font-size:0.75rem;font-weight:600;">Nama</label><input id="swal-inv-name" class="swal2-input" value="${item.name || ""}" style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Kategori</label><input id="swal-inv-cat" class="swal2-input" value="${item.category || ""}" style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Jumlah</label><input id="swal-inv-qty" type="number" class="swal2-input" value="${item.quantity || 1}" style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Kondisi</label><select id="swal-inv-cond" class="swal2-select" style="margin:0;height:2.5rem;font-size:0.875rem;width:100%;padding:0 0.5rem;"><option value="Baik" ${item.condition === "Baik" ? "selected" : ""}>Baik</option><option value="Rusak Ringan" ${item.condition === "Rusak Ringan" ? "selected" : ""}>Rusak Ringan</option><option value="Rusak Berat" ${item.condition === "Rusak Berat" ? "selected" : ""}>Rusak Berat</option></select></div><div><label style="font-size:0.75rem;font-weight:600;">Lokasi</label><input id="swal-inv-loc" class="swal2-input" value="${item.location || ""}" style="margin:0;height:2.5rem;font-size:0.875rem;"></div><div><label style="font-size:0.75rem;font-weight:600;">Harga Perolehan</label><input id="swal-inv-cost" type="number" class="swal2-input" value="${item.acquisitionCost || 0}" style="margin:0;height:2.5rem;font-size:0.875rem;"></div></div>`, showCancelButton: true, confirmButtonText: "Simpan", cancelButtonText: "Batal", confirmButtonColor: "#3b82f6", preConfirm: () => ({ name: (document.getElementById("swal-inv-name") as HTMLInputElement).value, category: (document.getElementById("swal-inv-cat") as HTMLInputElement).value, quantity: parseInt((document.getElementById("swal-inv-qty") as HTMLInputElement).value) || 1, condition: (document.getElementById("swal-inv-cond") as HTMLSelectElement).value, location: (document.getElementById("swal-inv-loc") as HTMLInputElement).value, acquisitionCost: parseInt((document.getElementById("swal-inv-cost") as HTMLInputElement).value) || 0 }) }).then(async r => { if (r.isConfirmed) { try { const resUp = await fetch(`/api/inventory/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r.value) }); if (resUp.ok) { Swal.fire("Berhasil", "Aset diperbarui.", "success"); loadInventory(); } else { const d = await resUp.json(); Swal.fire("Gagal", d.error, "error"); } } catch { Swal.fire("Error", "Server error", "error"); } } }); } catch { Swal.fire("Error", "Gagal memuat aset", "error"); } };

  const handleDelete = (id: number) => { Swal.fire({ title: "Write-off Aset?", text: "Aset dihapus permanen.", icon: "warning", showCancelButton: true, confirmButtonColor: "#e11d48", confirmButtonText: "Ya, Hapus", cancelButtonText: "Batal" }).then(async r => { if (r.isConfirmed) { try { const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" }); const json = await res.json(); if (res.ok && json.success) { Swal.fire("Terhapus", "Aset dihapus.", "success"); loadInventory(); } else Swal.fire("Gagal", json.error, "error"); } catch { Swal.fire("Error", "Server error", "error"); } } }); };

  const condMap: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = { "Baik": { variant: "success", label: "Baik" }, "Rusak Ringan": { variant: "warning", label: "Rusak Ringan" }, "Rusak Berat": { variant: "danger", label: "Rusak Berat" } };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Hero + Total Nilai */}
      <div className="bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shrink-0"><span className="text-white"><BoxIcon /></span></div>
              <div><h2 className="font-heading font-bold text-xl text-white m-0">Inventaris Madrasah</h2><p className="text-sm text-white/70 mt-0.5">Pencatatan & Pengelolaan Aset Barang Madrasah</p></div>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl px-5 py-3 text-right">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-0.5">Total Nilai Aset</p>
              <p className="font-heading font-extrabold text-xl text-white m-0">Rp {totalValue.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600" /><h4 className="font-heading font-bold text-sm text-slate-800 m-0">Daftar Aset</h4></div>
          <Button variant="primary" size="sm" icon={<PlusIcon />} onClick={handleAdd}>Tambah Aset</Button>
        </div>

        {/* Filter */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <input type="text" placeholder="Cari nama, kategori, lokasi..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-[200px] px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all" />
          <select value={conditionFilter} onChange={e => setConditionFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-blue-200 min-w-[140px]">
            <option value="">Semua Kondisi</option>
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
              {["No", "Nama Barang", "Kategori", "Jumlah", "Kondisi", "Aksi"].map((h, i) => (
                <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 ${i === 0 || i === 3 ? "text-center" : i === 5 ? "text-right" : "text-left"} ${i === 0 ? "w-12" : ""}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-12 text-center text-sm text-slate-400">Memuat...</td></tr>
              : filteredData.length === 0 ? <tr><td colSpan={6} className="p-12 text-center"><p className="font-heading font-bold text-slate-700">Aset Inventaris Kosong</p></td></tr>
              : filteredData.map((item, i) => {
                const cm = condMap[item.condition] || { variant: "neutral" as const, label: item.condition };
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3.5 text-center text-sm text-slate-400 font-semibold">{i + 1}</td>
                    <td className="px-4 py-3.5"><p className="font-semibold text-sm text-slate-800 m-0">{item.name}</p>{item.location && <p className="text-xs text-slate-400 mt-0.5">📍 {item.location}</p>}</td>
                    <td className="px-4 py-3.5"><Badge variant="neutral">{item.category || "-"}</Badge></td>
                    <td className="px-4 py-3.5 text-center font-bold text-sm text-slate-700">{item.quantity || 0}</td>
                    <td className="px-4 py-3.5 text-center"><Badge variant={cm.variant} dot>{cm.label}</Badge></td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item.id)}>Edit</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>Hapus</Button>
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
