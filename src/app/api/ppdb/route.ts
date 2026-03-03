import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") || "";

  try {
    const list = await prisma.ppdbRegistration.findMany({
      where: {
        deletedAt: null,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { fatherName: { contains: search, mode: "insensitive" } },
              { motherName: { contains: search, mode: "insensitive" } },
              { formNo: { contains: search } },
            ]
          : undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    // Ambil payments terkait (relasi polymorphic)
    const regIds = list.map(r => r.id);
    const payments = regIds.length > 0
      ? await prisma.registrationPayment.findMany({
          where: {
            payableType: "ppdb",
            payableId: { in: regIds },
            deletedAt: null,
          },
        })
      : [];

    // Gabungkan payments ke masing-masing registrasi
    const dataWithPayments = list.map(r => ({
      ...r,
      payments: payments.filter(p => p.payableId === r.id),
    }));

    const pending = list.filter((r) => r.status === "menunggu" || r.status === "pending").length;
    const diterima = list.filter((r) => r.status === "diterima").length;
    const ditolak = list.filter((r) => r.status === "ditolak").length;

    const stats = {
      total: list.length,
      pending,
      diterima,
      ditolak,
    };

    return NextResponse.json({ success: true, data: dataWithPayments, stats });
  } catch (error) {
    console.error("PPDB GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ success: false, message: "Nama calon murid wajib diisi" }, { status: 400 });
    }

    // Auto-generate nomor formulir
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const count = await prisma.ppdbRegistration.count();
    const formNo = `PPDB-${yearMonth}-${String(count + 1).padStart(4, "0")}`;

    const registration = await prisma.ppdbRegistration.create({
      data: {
        formNo,
        name: body.name,
        gender: body.gender || "L",
        birthPlace: body.birthPlace || "",
        birthDate: body.birthDate || "",
        nik: body.nik || "",
        noKk: body.noKk || "",
        nisn: body.nisn || "",
        phone: body.phone || "",
        address: body.address || "",
        previousSchool: body.previousSchool || "",
        targetClassroom: body.targetClassroom || "",
        status: "pending",
        registrationSource: "offline",
        notes: body.notes || "",
        // A. Identitas (Dapodik)
        familyStatus: body.familyStatus || "",
        siblingCount: body.siblingCount ? Number(body.siblingCount) : null,
        childPosition: body.childPosition ? Number(body.childPosition) : null,
        religion: body.religion || "Islam",
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
        fatherName: body.fatherName || "",
        fatherNik: body.fatherNik || "",
        fatherBirthPlace: body.fatherBirthPlace || "",
        fatherBirthDate: body.fatherBirthDate || "",
        fatherEducation: body.fatherEducation || "",
        fatherOccupation: body.fatherOccupation || "",
        motherName: body.motherName || "",
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
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pendaftaran ${formNo} berhasil disimpan`,
      data: registration,
    });
  } catch (error) {
    console.error("PPDB POST error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan pendaftaran" }, { status: 500 });
  }
}
