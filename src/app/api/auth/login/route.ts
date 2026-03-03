import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        deletedAt: null,
        status: "aktif",
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email tidak ditemukan atau akun nonaktif." },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Password salah." },
        { status: 401 }
      );
    }

    // Set cookie JWT
    await setAuthCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      unitId: user.unitId || "",
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
