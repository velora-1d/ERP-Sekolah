import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const { name, nisn, nik, gender, religion, category, status, place_of_birth, date_of_birth, previous_school, address, village, district, father_name, mother_name, parent_phone, parent_job, classroom } = body;

    const student = await prisma.student.create({
      data: {
        name,
        nisn: nisn || "",
        gender: gender || "L",
        category: category || "reguler",
        status: status || "aktif",
        birthPlace: place_of_birth || "",
        birthDate: date_of_birth || "",
        address: address || "",
        fatherName: father_name || "",
        motherName: mother_name || "",
        phone: parent_phone || "",
        classroomId: classroom ? Number(classroom) : null,
      }
    });

    return NextResponse.json({ success: true, message: "Data siswa berhasil ditambahkan", data: student });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai siswa lain" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
