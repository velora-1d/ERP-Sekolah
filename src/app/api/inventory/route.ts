import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/inventory
export async function GET() {
  try {
    const inventories = await prisma.inventory.findMany({
      where: { deletedAt: null },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(inventories);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data inventaris" },
      { status: 500 }
    );
  }
}

// POST /api/inventory
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, quantity, condition, location, acquisitionCost } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama aset wajib diisi" },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.create({
      data: {
        name,
        category: category || "",
        location: location || "",
        quantity: Number(quantity) || 1,
        condition: condition || "Baik",
        acquisitionCost: Number(acquisitionCost) || 0,
      },
    });

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat data inventaris" },
      { status: 500 }
    );
  }
}
