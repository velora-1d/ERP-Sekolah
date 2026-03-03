import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const students = await prisma.student.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ success: true, data: students });
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
        classroomId: classroom || "",
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
