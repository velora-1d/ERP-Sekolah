import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/rbac";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await requireAuth();
    const id = parseInt(params.id);
    const student = await prisma.student.findFirst({
      where: { id, deletedAt: null },
      include: {
        classroom: true,
        infaqBills: { where: { deletedAt: null }, orderBy: { month: "desc" }, take: 12 },
        savings: { where: { deletedAt: null, status: "active" }, orderBy: { createdAt: "desc" }, take: 10 },
        enrollments: { include: { classroom: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!student) return NextResponse.json({ success: false, message: "Siswa tidak ditemukan" }, { status: 404 });

    // Hitung saldo tabungan
    let savingsBalance = 0;
    const allSv = await prisma.studentSaving.findMany({ where: { studentId: id, deletedAt: null, status: "active" } });
    allSv.forEach((sv) => { if (sv.type === "setor") savingsBalance += sv.amount; else if (sv.type === "tarik") savingsBalance -= sv.amount; });

    const tunggakan = student.infaqBills.filter((b) => b.status === "belum_lunas").length;

    return NextResponse.json({ success: true, data: { ...student, savingsBalance, tunggakanCount: tunggakan } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
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
        classroomId: classroom ? Number(classroom) : null,
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
