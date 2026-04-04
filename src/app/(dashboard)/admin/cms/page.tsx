import { db } from "@/db";
import { 
  webPosts, webTeachers, webFacilities, 
  webAchievements, webHeroes 
} from "@/db/schema";
import { count } from "drizzle-orm";
import Link from "next/link";

async function getCMSStats() {
  const [
    postsCount,
    teachersCount,
    facilitiesCount,
    achievementsCount,
    heroesCount
  ] = await Promise.all([
    db.select({ count: count() }).from(webPosts),
    db.select({ count: count() }).from(webTeachers),
    db.select({ count: count() }).from(webFacilities),
    db.select({ count: count() }).from(webAchievements),
    db.select({ count: count() }).from(webHeroes),
  ]);

  return {
    posts: postsCount[0]?.count || 0,
    teachers: teachersCount[0]?.count || 0,
    facilities: facilitiesCount[0]?.count || 0,
    achievements: achievementsCount[0]?.count || 0,
    heroes: heroesCount[0]?.count || 0,
  };
}

export default async function CMSPage() {
  const stats = await getCMSStats();

  const modules = [
    { name: "Berita & Artikel", href: "/admin/cms/posts", count: stats.posts, icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM7 8h5m-5 4h5m-5 4h10", color: "blue" },
    { name: "Tenaga Pengajar", href: "/admin/cms/teachers", count: stats.teachers, icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", color: "purple" },
    { name: "Fasilitas Sekolah", href: "/admin/cms/facilities", count: stats.facilities, icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", color: "green" },
    { name: "Prestasi Siswa", href: "/admin/cms/achievements", count: stats.achievements, icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", color: "amber" },
    { name: "Hero / Banner", href: "/admin/cms/heroes", count: stats.heroes, icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "rose" },
    { name: "Pengaturan Web", href: "/admin/cms/settings", count: null, icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z", color: "slate" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Website CMS</h1>
          <p className="text-slate-500 mt-1">Kelola konten yang ditampilkan di website profil sekolah.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold border border-indigo-100">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Pusat Kontrol Website
        </div>
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, i) => (
          <Link 
            key={i} 
            href={mod.href}
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 relative overflow-hidden flex flex-col items-center text-center"
          >
            <div className={`w-16 h-16 rounded-2xl bg-${mod.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <svg className={`w-8 h-8 text-${mod.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mod.icon} />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{mod.name}</h3>
            {mod.count !== null && (
              <p className="text-sm font-medium text-slate-500">{mod.count} entri data</p>
            )}
            <div className="mt-6 w-full py-2 bg-slate-50 rounded-xl text-slate-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              Kelola Modul
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
