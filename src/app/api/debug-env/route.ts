import { NextResponse } from "next/server";

/**
 * Endpoint debug untuk melihat env vars yang tersedia di Vercel.
 * HAPUS SETELAH SELESAI DEBUG!
 */
export async function GET() {
  // Cek semua kemungkinan nama env var database
  const envCheck: Record<string, string> = {};
  
  const keysToCheck = [
    "DATABASE_URL",
    "POSTGRES_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_URL_NO_SSL",
    "POSTGRES_HOST",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DATABASE",
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "JWT_SECRET",
    "NEXT_PUBLIC_APP_NAME",
    "NODE_ENV",
  ];
  
  for (const key of keysToCheck) {
    const val = process.env[key];
    if (val) {
      // Mask password/keys
      if (key.includes("PASSWORD") || key.includes("KEY") || key.includes("SECRET")) {
        envCheck[key] = val.substring(0, 8) + "***";
      } else if (key.includes("URL") && val.includes("@")) {
        envCheck[key] = val.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
      } else {
        envCheck[key] = val;
      }
    } else {
      envCheck[key] = "❌ TIDAK SET";
    }
  }
  
  return NextResponse.json({
    info: "Debug Environment Variables - HAPUS SETELAH SELESAI!",
    environment_variables: envCheck,
    hint: "Jika DATABASE_URL tidak set tapi POSTGRES_PRISMA_URL set, berarti perlu sinkronisasi nama env var."
  });
}
