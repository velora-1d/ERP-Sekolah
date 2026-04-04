"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
}

interface Classroom {
  id: number;
  name: string;
  academicYearId?: number;
}

export type FilterType = 
  | "academicYear" 
  | "semester" 
  | "month" 
  | "classroom" 
  | "gender" 
  | "status" 
  | "type" 
  | "ageRange";

interface FilterBarProps {
  visibleFilters?: FilterType[];
  customStatusOptions?: { label: string; value: string }[];
  customTypeOptions?: { label: string; value: string }[];
}

export default function FilterBar({ 
  visibleFilters = ["academicYear", "semester", "month", "classroom", "gender"],
  customStatusOptions,
  customTypeOptions
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // State untuk filter yang disinkronkan dengan URL
  const [filters, setFilters] = useState({
    academicYearId: searchParams.get("academicYearId") || "",
    semester: searchParams.get("semester") || "",
    month: searchParams.get("month") || "",
    classroomId: searchParams.get("classroomId") || "",
    gender: searchParams.get("gender") || "",
    status: searchParams.get("status") || "",
    type: searchParams.get("type") || "",
    ageMin: searchParams.get("ageMin") || "",
    ageMax: searchParams.get("ageMax") || "",
  });

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    if (key === "academicYearId") {
      params.delete("classroomId");
      setFilters(prev => ({ ...prev, classroomId: "" }));
    }

    setFilters((prev) => ({ ...prev, [key]: value }));
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    // Ambil data Tahun Ajaran jika filter akademik aktif
    if (visibleFilters.includes("academicYear") || visibleFilters.includes("classroom")) {
      fetch("/api/academic-years")
        .then((res) => res.json())
        .then((data) => {
          const years: AcademicYear[] = data.success ? data.data : (Array.isArray(data) ? data : []);
          setAcademicYears(years);
          const active = years.find((y) => y.isActive);
          if (active && !searchParams.get("academicYearId") && visibleFilters.includes("academicYear")) {
            updateFilter("academicYearId", String(active.id));
          }
        });
    }

    // Ambil data Kelas jika filter kelas aktif
    if (visibleFilters.includes("classroom")) {
      fetch("/api/classrooms")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setClassrooms(data.data);
        });
    }
  }, [visibleFilters, searchParams, updateFilter]);

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const isVisible = (type: FilterType) => visibleFilters.includes(type);

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200/60 mb-6 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
      {isVisible("academicYear") && (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tahun Ajaran</label>
          <select
            value={filters.academicYearId}
            onChange={(e) => updateFilter("academicYearId", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Tahun</option>
            {academicYears.map((y) => (
              <option key={y.id} value={String(y.id)}>
                {y.year} {y.isActive ? "(Aktif)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {isVisible("semester") && (
        <div className="flex flex-col gap-1 min-w-[100px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Semester</label>
          <select
            value={filters.semester}
            onChange={(e) => updateFilter("semester", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua</option>
            <option value="ganjil">Ganjil</option>
            <option value="genap">Genap</option>
          </select>
        </div>
      )}

      {isVisible("month") && (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Bulan</label>
          <select
            value={filters.month}
            onChange={(e) => updateFilter("month", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Bulan</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      )}

      {isVisible("classroom") && (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Kelas</label>
          <select
            value={filters.classroomId}
            onChange={(e) => updateFilter("classroomId", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Kelas</option>
            {classrooms
              .filter(c => !filters.academicYearId || c.academicYearId === Number(filters.academicYearId))
              .map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
          </select>
        </div>
      )}

      {isVisible("gender") && (
        <div className="flex flex-col gap-1 min-w-[100px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => updateFilter("gender", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      )}

      {isVisible("status") && (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Status</option>
            {customStatusOptions ? (
              customStatusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)
            ) : (
              <>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-Aktif</option>
                <option value="lulus">Lulus</option>
                <option value="pindah">Pindah</option>
              </>
            )}
          </select>
        </div>
      )}

      {isVisible("type") && (
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Tipe</label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-full p-2.5 font-semibold outline-none transition-all cursor-pointer"
          >
            <option value="">Semua Tipe</option>
            {customTypeOptions?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {isVisible("ageRange") && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Umur Min</label>
            <input 
              type="number"
              placeholder="Min"
              value={filters.ageMin}
              onChange={(e) => updateFilter("ageMin", e.target.value)}
              className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-20 p-2.5 font-semibold outline-none transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Umur Max</label>
            <input 
              type="number"
              placeholder="Max"
              value={filters.ageMax}
              onChange={(e) => updateFilter("ageMax", e.target.value)}
              className="bg-slate-50/50 border border-slate-200 text-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block w-20 p-2.5 font-semibold outline-none transition-all"
            />
          </div>
        </>
      )}

      <button
        onClick={() => {
          setFilters({ 
            academicYearId: "", semester: "", month: "", classroomId: "", gender: "", status: "", type: "", ageMin: "", ageMax: "" 
          });
          router.push(pathname);
        }}
        className="mt-4 px-4 py-2 text-xs font-bold text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
      >
        Reset Filter
      </button>
    </div>
  );
}
