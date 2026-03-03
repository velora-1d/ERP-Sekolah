"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SIDEBAR_PERMISSIONS, type Role } from "@/lib/rbac-permissions";

const menuItems = [
  { group: "UTAMA", items: [
    { name: "Dashboard Utama", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  ]},
  { group: "PENERIMAAN SISWA", items: [
    { name: "Penerimaan PPDB", href: "/ppdb", icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" },
    { name: "Daftar Ulang Siswa", href: "/re-registration", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  ]},
  { group: "BASIS DATA UTAMA", items: [
    { name: "Data Siswa", href: "/students", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Mutasi & Kenaikan Kelas", href: "/mutations", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" },
    { name: "Daftar Kelas RI", href: "/classrooms", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { name: "Tahun Ajaran", href: "/academic-years", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { name: "Kategori Keuangan", href: "/transaction-categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
  ]},
  { group: "KEUANGAN & TAGIHAN", items: [
    { name: "Manajemen Infaq / SPP", href: "/infaq-bills", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { name: "Tabungan Siswa", href: "/tabungan", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { name: "Wakaf & Donasi", href: "/wakaf", icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" },
    { name: "Kas & Jurnal Umum", href: "/journal", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { name: "Laporan Lengkap", href: "/reports", icon: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" },
  ]},
  { group: "KEPEGAWAIAN (HR)", items: [
    { name: "Data Guru", href: "/teachers", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { name: "Data Staf", href: "/staff", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { name: "Slip Gaji / Payroll", href: "/payroll", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" },
    { name: "Inventaris Sekolah", href: "/inventory", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  ]},
  { group: "SISTEM", items: [
    { name: "Pengaturan Sistem", href: "/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ]},
];

/**
 * Cek apakah user dengan role tertentu boleh melihat menu item
 */
function hasMenuAccess(href: string, role: string): boolean {
  // Superadmin selalu akses semua
  if (role === "superadmin") return true;

  const allowed = SIDEBAR_PERMISSIONS[href];
  // Jika tidak ada di permission map → tampilkan (default show)
  if (!allowed) return true;
  return allowed.includes(role as Role);
}

export default function Sidebar({ user }: { user: { name: string; role: string } }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-72 h-full flex-shrink-0" style={{ background: "#1e1b4b", borderRight: "1px solid rgba(99,102,241,0.1)" }}>
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-6 py-6" style={{ borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
        <div style={{ padding: 8, background: "#f59e0b", borderRadius: 12, boxShadow: "0 4px 12px rgba(245,158,11,0.2)" }}>
          <span className="w-8 h-8 flex items-center justify-center font-extrabold text-lg" style={{ color: "#1e1b4b" }}>MI</span>
        </div>
        <span className="ml-3 text-xl font-bold text-white" style={{ letterSpacing: "-0.02em" }}>MI As-Saodah</span>
      </div>

      {/* Nav Menu — filtered by role */}
      <div id="sidebar-nav" className="flex-1 overflow-y-auto py-6">
        <nav className="px-4 space-y-1">
          {menuItems.map((group, gi) => {
            // Filter items berdasarkan role
            const visibleItems = group.items.filter(item => hasMenuAccess(item.href, user.role));

            // Jika tidak ada item yang visible di group ini, skip group
            if (visibleItems.length === 0) return null;

            return (
              <div key={gi}>
                <div className={`px-4 pb-2 ${gi > 0 ? "pt-4 mt-4" : "pt-2"}`} style={gi > 0 ? { borderTop: "1px solid rgba(99,102,241,0.15)" } : {}}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(129,140,248,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{group.group}</span>
                </div>
                {visibleItems.map((item, ii) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={ii} href={item.href}
                      className={`sidebar-menu flex items-center px-4 py-3 text-sm font-bold rounded-xl ${isActive ? "active" : ""}`}
                      style={{ color: "#c7d2fe" }}>
                      <svg className={`menu-icon mr-3 flex-shrink-0 h-5 w-5`} style={{ color: isActive ? "#f59e0b" : "#818cf8" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <span className="menu-text">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="flex-shrink-0 flex p-4" style={{ borderTop: "1px solid rgba(99,102,241,0.3)", background: "rgba(30,27,75,0.5)" }}>
        <div className="flex items-center w-full">
          <div className="w-10 h-10 flex items-center justify-center font-extrabold rounded-lg" style={{ background: "#f59e0b", color: "#1e1b4b", border: "2px solid #fbbf24" }}>
            {(user.name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="truncate" style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{user.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
