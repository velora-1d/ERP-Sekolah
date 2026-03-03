import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const student = await prisma.student.findFirst({
      where: { id: parseInt(params.id), deletedAt: null }
    });
    if (!student) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    
    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { name, nisn, nik, gender, religion, category, status, place_of_birth, date_of_birth, previous_school, address, village, district, father_name, mother_name, parent_phone, parent_job, classroom } = body;

    const student = await prisma.student.update({
      where: { id: parseInt(params.id) },
      data: {
        name,
        nisn,
        gender,
        category,
        status,
        birthPlace: place_of_birth,
        birthDate: date_of_birth,
        address,
        fatherName: father_name || "",
        motherName: mother_name || "",
        phone: parent_phone || "",
        classroomId: classroom || "",
      }
    });

    return NextResponse.json({ success: true, message: "Data siswa berhasil diupdate", data: student });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "NISN sudah dipakai" }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    // Soft delete
    await prisma.student.update({
      where: { id: parseInt(params.id) },
      data: { deletedAt: new Date() }
    });
    return NextResponse.json({ success: true, message: "Data dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
