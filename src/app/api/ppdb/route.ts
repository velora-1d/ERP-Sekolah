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
