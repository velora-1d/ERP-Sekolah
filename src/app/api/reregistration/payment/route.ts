import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { regId, field, amount } = body;

    if (!regId || !field) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    let paymentType = "";
    if (field === "is_fee_paid") paymentType = "fee";
    else if (field === "is_books_paid") paymentType = "books";
    else if (field === "is_uniform_paid") paymentType = "uniform";
    else if (field === "is_books_received") paymentType = "books_received";
    else if (field === "is_uniform_received") paymentType = "uniform_received";
    else {
      return NextResponse.json({ error: "Field tidak valid" }, { status: 400 });
    }

    const payableId = regId.toString();
    const payableType = "reregistration";

    let payment = await prisma.registrationPayment.findFirst({
      where: { payableId, payableType, paymentType, deletedAt: null }
    });

    let newStatus = true;

    if (payment) {
      newStatus = !payment.isPaid;
      await prisma.registrationPayment.update({
        where: { id: payment.id },
        data: { 
          isPaid: newStatus,
          nominal: amount !== undefined ? amount : payment.nominal
        }
      });
    } else {
      await prisma.registrationPayment.create({
        data: {
          payableId,
          payableType,
          paymentType,
          nominal: amount || 0,
          isPaid: true
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Status ${paymentType} berhasil diubah menjadi ${newStatus ? 'Selesai' : 'Belum'}`,
      newState: newStatus
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui status pembayaran" },
      { status: 500 }
    );
  }
}
