"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

  async function handleLogout() {
    if (!confirm("Keluar dari Sistem? Anda akan diminta login kembali.")) return;
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 flex-shrink-0" style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid #e2e8f0" }}>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex items-center text-sm text-gray-500 hover:text-indigo-600 font-semibold transition-colors">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Profil
        </Link>
        <div style={{ width: 1, height: 16, background: "#e2e8f0" }} />
        <button onClick={handleLogout} className="flex items-center text-sm text-gray-500 hover:text-red-600 font-semibold transition-colors cursor-pointer">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Keluar
        </button>
      </div>
    </header>
  );
}
