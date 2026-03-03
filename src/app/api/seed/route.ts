import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST() {
  try {
    // 1. Admin user
    const existing = await prisma.user.findFirst({ where: { email: "admin@assaodah.sch.id" } });
    if (!existing) {
      await prisma.user.create({
        data: { name: "Administrator", email: "admin@assaodah.sch.id", password: hashPassword("admin123"), role: "superadmin", status: "aktif" }
      });
    }

    // 2. Tahun Ajaran
    const ay = await prisma.academicYear.findFirst({ where: { year: "2025/2026" } });
    let ayId = ay?.id;
    if (!ay) {
      const created = await prisma.academicYear.create({ data: { year: "2025/2026", isActive: true, startDate: "2025-07-14", endDate: "2026-06-20" } });
      ayId = created.id;
    }

    // 3. Kelas 1-6
    const kelasNames = ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"];
    for (const name of kelasNames) {
      const exists = await prisma.classroom.findFirst({ where: { name, deletedAt: null } });
      if (!exists) {
        await prisma.classroom.create({ data: { name, academicYearId: String(ayId || "") } });
      }
    }
    const allKelas = await prisma.classroom.findMany({ where: { deletedAt: null } });

    // 4. Guru (6 orang)
    const guruNames = ["Ustadzah Fatimah", "Ustadz Ahmad", "Ustadzah Khadijah", "Ustadz Bilal", "Ustadzah Aisyah", "Ustadz Umar"];
    for (let i = 0; i < guruNames.length; i++) {
      const exists = await prisma.employee.findFirst({ where: { name: guruNames[i], deletedAt: null } });
      if (!exists) {
        await prisma.employee.create({
          data: { name: guruNames[i], nip: `G00${i + 1}`, type: "guru", position: `Wali ${kelasNames[i]}`, status: "aktif", phone: `08${1100000 + i}`, baseSalary: 2500000 + (i * 100000) }
        });
      }
    }

    // 5. Staf (5 orang)
    const stafNames = ["Pak Ridwan (TU)", "Bu Sri (Bendahara)", "Pak Joko (Penjaga)", "Bu Ani (Perpus)", "Pak Dedi (IT)"];
    for (let i = 0; i < stafNames.length; i++) {
      const exists = await prisma.employee.findFirst({ where: { name: stafNames[i], deletedAt: null } });
      if (!exists) {
        await prisma.employee.create({
          data: { name: stafNames[i], nip: `S00${i + 1}`, type: "staf", position: stafNames[i].split("(")[1]?.replace(")", "") || "Staf", status: "aktif", phone: `08${2200000 + i}`, baseSalary: 2000000 + (i * 50000) }
        });
      }
    }

    // 6. Siswa (10 per kelas = 60 total)
    const namaPA = ["Ahmad", "Muhammad", "Ali", "Hasan", "Ibrahim"];
    const namaPI = ["Fatimah", "Aisyah", "Khadijah", "Maryam", "Hafshah"];
    let siswaCount = 0;
    for (const kelas of allKelas) {
      for (let j = 0; j < 10; j++) {
        const gender = j < 5 ? "L" : "P";
        const nama = gender === "L" ? `${namaPA[j % 5]} ${kelas.name.replace("Kelas ", "")}${String.fromCharCode(65 + j)}` : `${namaPI[j % 5]} ${kelas.name.replace("Kelas ", "")}${String.fromCharCode(65 + j)}`;
        const exists = await prisma.student.findFirst({ where: { name: nama, deletedAt: null } });
        if (!exists) {
          await prisma.student.create({
            data: { name: nama, nisn: `00${1000 + siswaCount}`, nis: `${2025}${String(siswaCount + 1).padStart(3, "0")}`, gender, category: "reguler", classroomId: String(kelas.id), status: "aktif", entryDate: "2025-07-14", infaqStatus: "reguler", infaqNominal: 150000 }
          });
        }
        siswaCount++;
      }
    }

    // 7. PPDB (10 pendaftar)
    const ppdbNames = ["Zahra Putri", "Rafi Ahmad", "Nadia Safira", "Faris Hakim", "Siti Aminah", "Usman Fadli", "Layla Nur", "Hamza Rizki", "Dina Rahma", "Yusuf Akbar"];
    for (let i = 0; i < ppdbNames.length; i++) {
      const exists = await prisma.ppdbRegistration.findFirst({ where: { name: ppdbNames[i], deletedAt: null } });
      if (!exists) {
        await prisma.ppdbRegistration.create({
          data: { formNo: `PPDB-2025-${String(i + 1).padStart(3, "0")}`, name: ppdbNames[i], gender: i % 2 === 0 ? "P" : "L", birthPlace: "Bandung", birthDate: `201${8 + (i % 2)}-0${(i % 9) + 1}-${10 + i}`, fatherName: `Bapak ${ppdbNames[i].split(" ")[1]}`, motherName: `Ibu ${ppdbNames[i].split(" ")[1]}`, phone: `08${3300000 + i}`, address: `Jl. Contoh No. ${i + 1}`, status: i < 5 ? "pending" : "diterima", registrationSource: "offline" }
        });
      }
    }

    // 8. Kategori Keuangan
    const cats = [
      { name: "Infaq / SPP", type: "in" }, { name: "Wakaf", type: "in" }, { name: "Donasi Umum", type: "in" },
      { name: "Gaji Pengajar", type: "out" }, { name: "Operasional", type: "out" }, { name: "Perawatan Gedung", type: "out" },
    ];
    for (const cat of cats) {
      const exists = await prisma.transactionCategory.findFirst({ where: { name: cat.name, deletedAt: null } });
      if (!exists) {
        await prisma.transactionCategory.create({ data: cat });
      }
    }

    return NextResponse.json({ success: true, message: "Seed data dummy berhasil! Admin: admin@assaodah.sch.id / admin123" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, message: "Seed gagal: " + String(error) }, { status: 500 });
  }
}
