import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";

export default async function PpdbDetailPage(props: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const params = await props.params;
  const regId = Number(params.id);

  if (isNaN(regId)) return notFound();

  const reg = await prisma.ppdbRegistration.findUnique({
    where: { id: regId },
  });

  if (!reg || reg.deletedAt) return notFound();

  // Helper render
  const Item = ({ label, value }: { label: string; value: string | null | undefined | number }) => (
    <div style={{ marginBottom: "1rem" }}>
      <p style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>{label}</p>
      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b", margin: 0 }}>{value || "-"}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div style={{ background: "linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative", padding: "2rem" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
        
        <Link href="/ppdb" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", color: "rgba(255,255,255,0.8)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", textDecoration: "none", marginBottom: "1rem" }} className="hover:text-white transition-colors">
          <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke PPDB
        </Link>
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div style={{ display: "inline-block", padding: "0.25rem 0.75rem", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", color: "#fff", borderRadius: 999, fontSize: "0.6875rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              #{reg.formNo || reg.id}
            </div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "#fff", margin: 0 }}>{reg.name}</h2>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", margin: "0.25rem 0 0" }}>Jalur {reg.registrationSource === "online" ? "Online" : "Offline"} | Status: <span style={{ textTransform: "capitalize", fontWeight: 700 }}>{reg.status}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A. Identitas Calon Siswa */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 32, height: 32, background: "#eef2ff", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 16, height: 16, color: "#4f46e5" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "#1e293b", margin: 0 }}>Identitas Calon Siswa</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Item label="Nama Lengkap" value={reg.name} />
            <Item label="Jenis Kelamin" value={reg.gender === "L" ? "Laki-laki" : "Perempuan"} />
            <Item label="Tempat, Tanggal Lahir" value={`${reg.birthPlace}, ${reg.birthDate}`} />
            <Item label="NIK" value={reg.nik} />
            <Item label="No KK" value={reg.noKk} />
            <Item label="NISN" value={reg.nisn} />
            <Item label="No. Handphone" value={reg.phone} />
            <Item label="Agama" value={reg.religion} />
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
            <Item label="Asal Sekolah" value={reg.previousSchool} />
            <Item label="Kelas Tujuan" value={reg.targetClassroom} />
          </div>
        </div>

        {/* C. Identitas Orang Tua */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <div style={{ width: 32, height: 32, background: "#ecfdf5", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg style={{ width: 16, height: 16, color: "#059669" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "#1e293b", margin: 0 }}>Data Orang Tua / Wali</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0ea5e9", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e0f2fe", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Data Ayah</p>
              <div className="grid grid-cols-2 gap-4">
                <Item label="Nama Ayah" value={reg.fatherName} />
                <Item label="NIK Ayah" value={reg.fatherNik} />
                <Item label="Pekerjaan" value={reg.fatherOccupation} />
                <Item label="Pendidikan" value={reg.fatherEducation} />
              </div>
            </div>
            
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ec4899", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #fce7f3", paddingBottom: "0.5rem", marginBottom: "1rem" }}>Data Ibu</p>
              <div className="grid grid-cols-2 gap-4">
                <Item label="Nama Ibu" value={reg.motherName} />
                <Item label="NIK Ibu" value={reg.motherNik} />
                <Item label="Pekerjaan" value={reg.motherOccupation} />
                <Item label="Pendidikan" value={reg.motherEducation} />
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
              <Item label="Penghasilan Ortu" value={reg.parentIncome} />
              <Item label="Status Dlm Keluarga" value={reg.familyStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
