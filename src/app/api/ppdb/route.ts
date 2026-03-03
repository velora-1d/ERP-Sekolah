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

    const pending = list.filter((r) => r.status === "menunggu").length;
    const diterima = list.filter((r) => r.status === "diterima").length;
    const ditolak = list.filter((r) => r.status === "ditolak").length;

    // Hitung Stats Payment
    let totalFee = 0, countFee = 0;
    let totalBooks = 0, countBooks = 0;
    let totalUniform = 0, countUniform = 0;

    const currentFee = 0;
    const currentBooks = 0;
    const currentUniform = 0;

    const stats = {
      total: list.length,
      pending,
      diterima,
      ditolak,
      payments: {
        total_fee: totalFee, count_fee: countFee,
        total_books: totalBooks, count_books: countBooks,
        total_uniform: totalUniform, count_uniform: countUniform,
        grand_total: totalFee + totalBooks + totalUniform,
        // fees setting reference
        fee_amount: currentFee,
        books_amount: currentBooks,
        uniform_amount: currentUniform
      }
    };

    return NextResponse.json({ success: true, data: list, stats });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}
