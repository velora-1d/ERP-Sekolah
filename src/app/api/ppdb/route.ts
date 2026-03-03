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
              { student_name: { contains: search, mode: "insensitive" } },
              { parent_name: { contains: search, mode: "insensitive" } },
              { form_no: { contains: search } },
            ]
          : undefined,
      },
      include: {
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const pending = list.filter((r) => r.status === "menunggu").length;
    const diterima = list.filter((r) => r.status === "diterima").length;
    const ditolak = list.filter((r) => r.status === "ditolak").length;

    // Hitung Stats Payment (misal biaya admin default atau ambil dari settings, 
    // tapi karena DB schema belum ada tabel dinamis settings untuk PPDB selain hardcoded 
    // kita sementara pakai data payment yang ada di DB table ppdb_payments.)
    // Asumsi biaya standard jika tidak ada di DB:
    let totalFee = 0, countFee = 0;
    let totalBooks = 0, countBooks = 0;
    let totalUniform = 0, countUniform = 0;

    // Untuk demo / preview, kita ambil fee_amount dari record pertama yang ada, atau fallback
    const samplePayment = list.find(r => r.payment)?.payment;
    const currentFee = samplePayment?.fee_amount || 0;
    const currentBooks = samplePayment?.books_fee_amount || 0;
    const currentUniform = samplePayment?.uniform_fee_amount || 0;

    list.forEach(r => {
      const p = r.payment;
      if (p) {
        if (p.is_fee_paid) { totalFee += p.fee_amount; countFee++; }
        if (p.is_books_paid) { totalBooks += p.books_fee_amount; countBooks++; }
        if (p.is_uniform_paid) { totalUniform += p.uniform_fee_amount; countUniform++; }
      }
    });

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
