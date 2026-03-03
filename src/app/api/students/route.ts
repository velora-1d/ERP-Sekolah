import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Mengekstrak field Dapodik dari body request.
 * Menangani field lama (place_of_birth, father_name dll) DAN field baru (birthPlace, fatherName dll).
 */
function extractStudentData(body: any) {
  return {
    name: body.name,
    nisn: body.nisn || "",
    nis: body.nis || "",
    nik: body.nik || "",
    noKk: body.noKk || body.no_kk || "",
    gender: body.gender || "L",
    religion: body.religion || "Islam",
    category: body.category || "reguler",
    status: body.status || "aktif",
    birthPlace: body.birthPlace || body.place_of_birth || "",
    birthDate: body.birthDate || body.date_of_birth || "",
    address: body.address || "",
    phone: body.phone || body.parent_phone || "",
    classroomId: (body.classroomId || body.classroom) ? Number(body.classroomId || body.classroom) : null,
    // A. Identitas (Dapodik)
    familyStatus: body.familyStatus || "",
    siblingCount: body.siblingCount ? Number(body.siblingCount) : null,
    childPosition: body.childPosition ? Number(body.childPosition) : null,
    village: body.village || "",
    district: body.district || "",
    residenceType: body.residenceType || "",
    transportation: body.transportation || "",
    studentPhone: body.studentPhone || "",
    // B. Periodik
    height: body.height ? Number(body.height) : null,
    weight: body.weight ? Number(body.weight) : null,
    distanceToSchool: body.distanceToSchool || "",
    travelTime: body.travelTime ? Number(body.travelTime) : null,
    // C. Orang Tua
    fatherName: body.fatherName || body.father_name || "",
    fatherNik: body.fatherNik || "",
    fatherBirthPlace: body.fatherBirthPlace || "",
    fatherBirthDate: body.fatherBirthDate || "",
    fatherEducation: body.fatherEducation || "",
    fatherOccupation: body.fatherOccupation || "",
    motherName: body.motherName || body.mother_name || "",
    motherNik: body.motherNik || "",
    motherBirthPlace: body.motherBirthPlace || "",
    motherBirthDate: body.motherBirthDate || "",
    motherEducation: body.motherEducation || "",
    motherOccupation: body.motherOccupation || "",
    parentIncome: body.parentIncome || "",
    // D. Wali
    guardianName: body.guardianName || "",
    guardianNik: body.guardianNik || "",
    guardianBirthPlace: body.guardianBirthPlace || "",
    guardianBirthDate: body.guardianBirthDate || "",
    guardianEducation: body.guardianEducation || "",
    guardianOccupation: body.guardianOccupation || "",
    guardianAddress: body.guardianAddress || "",
    guardianPhone: body.guardianPhone || "",
    // E. Administrasi
    infaqStatus: body.infaqStatus || "reguler",
    infaqNominal: body.infaqNominal ? Number(body.infaqNominal) : 0,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("q") || "";
  const classroom = searchParams.get("classroom") || "";

  try {
    const where: any = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search } },
      ];
    }
    if (classroom) {
      where.classroomId = Number(classroom);
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { classroom: { select: { id: true, name: true } } },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = extractStudentData(body);

    if (!data.name) {
      return NextResponse.json({ success: false, message: "Nama siswa wajib diisi" }, { status: 400 });
    }

    const student = await prisma.student.create({ data });

    return NextResponse.json({ success: true, message: "Data siswa berhasil ditambahkan", data: student });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai siswa lain" }, { status: 400 });
    }
    console.error("Error creating student:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
