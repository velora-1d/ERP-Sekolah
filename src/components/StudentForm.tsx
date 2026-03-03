"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function StudentForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    nisn: initialData?.nisn || "",
    nik: initialData?.nik || "",
    gender: initialData?.gender || "L",
    religion: initialData?.religion || "Islam",
    category: initialData?.category || "reguler",
    status: initialData?.status || "aktif",
    place_of_birth: initialData?.birthPlace || "",
    date_of_birth: initialData?.birthDate?.substring(0, 10) || "",
    previous_school: initialData?.previousSchool || "",
    address: initialData?.address || "",
    village: initialData?.village || "",
    district: initialData?.district || "",
    father_name: initialData?.fatherName || "",
    mother_name: initialData?.motherName || "",
    parent_phone: initialData?.parentPhone || "",
    parent_job: initialData?.parentJob || "",
    classroom: initialData?.classroom || "",
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/students/${initialData.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        Swal.fire("Berhasil", json.message, "success").then(() => {
          router.push("/students");
        });
      } else {
        Swal.fire("Gagal", json.message || "Error", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ maxWidth: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }}></div>
        <div style={{ padding: "2rem", position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/students" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", transition: "background 0.2s" }} className="hover:bg-white/30">
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff", margin: 0 }}>
              {isEdit ? "Edit Siswa" : "Tambah Siswa"}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.7)", marginTop: "0.125rem" }}>Lengkapi informasi data diri siswa</p>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          
          {/* Section A: Identitas Siswa */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, color: "#6366f1", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "1.5rem", height: "1.5rem", background: "#eef2ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", color: "#4f46e5", fontWeight: 800 }}>A</span>
              Identitas Siswa
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="sm:grid-cols-2 grid-cols-1">
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Nama Lengkap <span style={{ color: "#e11d48" }}>*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>NISN / NIS <span style={{ color: "#e11d48" }}>*</span></label>
                <input type="text" name="nisn" value={formData.nisn} onChange={handleChange} required style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>NIK</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Jenis Kelamin <span style={{ color: "#e11d48" }}>*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange} required style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 bg-white">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Agama</label>
                <select name="religion" value={formData.religion} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 bg-white">
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Tempat Lahir</label>
                <input type="text" name="place_of_birth" value={formData.place_of_birth} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Tanggal Lahir</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Kategori Biaya <span style={{ color: "#e11d48" }}>*</span></label>
                <select name="category" value={formData.category} onChange={handleChange} required style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 bg-white">
                  <option value="reguler">Reguler</option>
                  <option value="yatim">Yatim</option>
                  <option value="kurang_mampu">Kurang Mampu</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Status <span style={{ color: "#e11d48" }}>*</span></label>
                <select name="status" value={formData.status} onChange={handleChange} required style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 bg-white">
                  <option value="aktif">Aktif</option>
                  <option value="lulus">Lulus</option>
                  <option value="pindah">Pindah</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Asal Sekolah</label>
                <input type="text" name="previous_school" value={formData.previous_school} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" placeholder="TK/RA/Madrasah" />
              </div>
            </div>
          </div>

          {/* Section B: Alamat */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, color: "#6366f1", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "1.5rem", height: "1.5rem", background: "#eef2ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", color: "#4f46e5", fontWeight: 800 }}>B</span>
              Alamat
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="sm:grid-cols-2 grid-cols-1">
              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Alamat Lengkap</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none", resize: "none" }} className="focus:border-indigo-500 transition-colors"></textarea>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Desa/Kelurahan</label>
                <input type="text" name="village" value={formData.village} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Kecamatan</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Section C: Data Orang Tua */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.875rem", fontWeight: 700, color: "#6366f1", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "1.5rem", height: "1.5rem", background: "#eef2ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", color: "#4f46e5", fontWeight: 800 }}>C</span>
              Data Orang Tua
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }} className="sm:grid-cols-2 grid-cols-1">
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Nama Ayah</label>
                <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Nama Ibu</label>
                <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>No HP Orang Tua</label>
                <input type="text" name="parent_phone" value={formData.parent_phone} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.375rem" }}>Pekerjaan Orang Tua</label>
                <input type="text" name="parent_job" value={formData.parent_job} onChange={handleChange} style={{ width: "100%", boxSizing: "border-box", padding: "0.625rem 0.875rem", border: "1.5px solid #e2e8f0", borderRadius: "0.5rem", fontSize: "0.8125rem", outline: "none" }} className="focus:border-indigo-500 transition-colors" />
              </div>
            </div>
          </div>

          <div style={{ paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
            <Link href="/students" style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#475569", background: "#f1f5f9", cursor: "pointer" }} className="hover:bg-slate-200 transition-colors">Batal</Link>
            <button type="submit" disabled={loading} style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#6366f1,#4f46e5)", border: "none", cursor: "pointer" }} className="hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? "Menyimpan..." : (isEdit ? "Update Data" : "Simpan Data")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
