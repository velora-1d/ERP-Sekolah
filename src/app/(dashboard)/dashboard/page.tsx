import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

async function getDashboardData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    students,
    employees,
    classrooms,
    ppdb,
    incomeThisMonth,
    expenseThisMonth,
    savingsDeposits,
    savingsWithdrawals,
    wakafIncome,
    tunggakan,
  ] = await Promise.all([
    prisma.student.findMany({ where: { deletedAt: null, status: "aktif" } }),
    prisma.employee.findMany({ where: { deletedAt: null, status: "aktif" } }),
    prisma.classroom.findMany({ where: { deletedAt: null } }),
    prisma.ppdbRegistration.findMany({ where: { deletedAt: null } }),
    // Pemasukan bulan ini
    prisma.generalTransaction.aggregate({
      where: { type: "in", status: "valid", deletedAt: null, createdAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    // Pengeluaran bulan ini
    prisma.generalTransaction.aggregate({
      where: { type: "out", status: "valid", deletedAt: null, createdAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    // Total setor tabungan
    prisma.studentSaving.aggregate({
      where: { type: "setor", status: "active", deletedAt: null },
      _sum: { amount: true },
    }),
    // Total tarik tabungan
    prisma.studentSaving.aggregate({
      where: { type: "tarik", status: "active", deletedAt: null },
      _sum: { amount: true },
    }),
    // Total wakaf masuk
    prisma.generalTransaction.aggregate({
      where: { type: "in", status: "valid", deletedAt: null, wakafDonorId: { not: null } },
      _sum: { amount: true },
    }),
    // Tunggakan
    prisma.infaqBill.findMany({
      where: { status: "belum_lunas", deletedAt: null },
      include: { student: { select: { gender: true } } },
    }),
  ]);

  const totalSiswaPa = students.filter((s: { gender: string }) => s.gender === "L").length;
  const totalSiswaPi = students.filter((s: { gender: string }) => s.gender === "P").length;
  const guru = employees.filter((e: { type: string }) => e.type === "guru");
  const staf = employees.filter((e: { type: string }) => e.type === "staf");
  const ppdbPending = ppdb.filter((p: { status: string }) => p.status === "pending" || p.status === "menunggu").length;
  const ppdbDiterima = ppdb.filter((p: { status: string }) => p.status === "diterima").length;

  const saldoTabungan = (savingsDeposits._sum.amount || 0) - (savingsWithdrawals._sum.amount || 0);
  const tunggakanPa = tunggakan.filter((t) => t.student?.gender === "L").length;
  const tunggakanPi = tunggakan.filter((t) => t.student?.gender === "P").length;

  // Kepatuhan SPP: siswa yg TIDAK punya tunggakan bulan ini
  const siswaIdDenganTunggakan = new Set(tunggakan.map((t) => t.studentId));
  const lunasCount = students.filter((s) => !siswaIdDenganTunggakan.has(s.id)).length;
  const complianceRate = students.length > 0 ? Math.round((lunasCount / students.length) * 100) : 0;
  const compliancePa = students.filter((s) => s.gender === "L" && !siswaIdDenganTunggakan.has(s.id)).length;
  const compliancePi = students.filter((s) => s.gender === "P" && !siswaIdDenganTunggakan.has(s.id)).length;

  return {
    totalSiswa: students.length,
    totalSiswaPa,
    totalSiswaPi,
    totalGuru: guru.length,
    totalStaff: staf.length,
    totalKelas: classrooms.length,
    ppdbPending,
    ppdbDiterima,
    pemasukanBulanIni: incomeThisMonth._sum.amount || 0,
    pengeluaranBulanIni: expenseThisMonth._sum.amount || 0,
    saldoTabungan,
    totalWakaf: wakafIncome._sum.amount || 0,
    tunggakanTotal: tunggakan.length,
    tunggakanPa,
    tunggakanPi,
    complianceRate,
    compliancePa,
    compliancePi,
  };
}

function fmtRp(n: number) {
  return "Rp " + (n || 0).toLocaleString("id-ID");
}

export default async function DashboardPage() {
  const user = await getAuthUser();
  const data = await getDashboardData();

  return (
    <>
      {/* Hero Header */}
      <div className="anim-hero" style={{ background: "linear-gradient(135deg,#312e81 0%,#1e1b4b 50%,#0f172a 100%)", borderRadius: "1rem", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 200, height: 200, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", right: 80, bottom: -40, width: 150, height: 150, background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
        <div style={{ padding: "2rem", position: "relative", zIndex: 10 }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 flex items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.15)" }}>
                <svg className="w-5.5 h-5.5" style={{ color: "#f59e0b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "#fff" }}>Halo, {user?.name || "Administrator"}!</h2>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginTop: "0.125rem" }}>Selamat datang di Panel Administrasi MI As-Saodah.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Baris 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard anim={1} label="Total Siswa Aktif" value={data.totalSiswa} color="#6366f1" bg="#e0e7ff" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          footer={<><span>Putra: <strong style={{ color: "#6366f1" }}>{data.totalSiswaPa}</strong></span><span>Putri: <strong style={{ color: "#f59e0b" }}>{data.totalSiswaPi}</strong></span></>}
        />
        <KpiCard anim={2} label="Total Guru & Staff" value={data.totalGuru + data.totalStaff} color="#8b5cf6" bg="#ede9fe" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          footer={<><span>Guru: <strong style={{ color: "#8b5cf6" }}>{data.totalGuru}</strong></span><span>Staff: <strong style={{ color: "#a78bfa" }}>{data.totalStaff}</strong></span></>}
        />
        <KpiCard anim={3} label="Total Kelas Aktif" value={data.totalKelas} color="#22c55e" bg="#dcfce7" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          footer={<><span>Terdaftar: <strong style={{ color: "#22c55e" }}>{data.totalKelas}</strong></span><span>Siswa: <strong style={{ color: "#6366f1" }}>{data.totalSiswa}</strong></span></>}
        />
        <KpiCard anim={4} label="Pendaftar PPDB" value={data.ppdbPending + data.ppdbDiterima} color="#0ea5e9" bg="#e0f2fe" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          footer={<><span>Pending: <strong style={{ color: "#0ea5e9" }}>{data.ppdbPending}</strong></span><span>Diterima: <strong style={{ color: "#10b981" }}>{data.ppdbDiterima}</strong></span></>}
        />
        <KpiCard anim={5} label="Kepatuhan Lunas Infaq" value={`${data.complianceRate}%`} color="#f59e0b" bg="#fef3c7" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          footer={<><span>PA: <strong style={{ color: "#10b981" }}>{data.compliancePa}</strong></span><span>PI: <strong style={{ color: "#f59e0b" }}>{data.compliancePi}</strong></span></>}
        />
      </div>

      {/* KPI Cards Baris 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard anim={6} label="Pemasukan Bulan Ini" value={fmtRp(data.pemasukanBulanIni)} color="#10b981" bg="#d1fae5" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" small
          footer={<><span>Data Real</span><strong style={{ color: "#10b981" }}>Bulan Ini</strong></>}
        />
        <KpiCard anim={7} label="Pengeluaran Bulan Ini" value={fmtRp(data.pengeluaranBulanIni)} color="#f43f5e" bg="#ffe4e6" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" small valueColor="#f43f5e"
          footer={<><span>Data Real</span><strong style={{ color: "#f43f5e" }}>Bulan Ini</strong></>}
        />
        <KpiCard anim={8} label="Total Saldo Tabungan" value={fmtRp(data.saldoTabungan)} color="#06b6d4" bg="#cffafe" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" small
          footer={<><span>Seluruh Siswa</span><strong style={{ color: "#06b6d4" }}>Akumulatif</strong></>}
        />
        <KpiCard anim={9} label="Total Wakaf Masuk" value={fmtRp(data.totalWakaf)} color="#d97706" bg="#fef3c7" icon="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" small
          footer={<><span>Penerimaan</span><strong style={{ color: "#d97706" }}>Akumulatif</strong></>}
        />
        <KpiCard anim={10} label="Siswa Menunggak" value={data.tunggakanTotal} color="#f43f5e" bg="#ffe4e6" icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" valueColor="#f43f5e"
          footer={<><span>PA: <strong style={{ color: "#f43f5e" }}>{data.tunggakanPa}</strong></span><span>PI: <strong style={{ color: "#f43f5e" }}>{data.tunggakanPi}</strong></span></>}
        />
      </div>
    </>
  );
}

function KpiCard({ anim, label, value, color, bg, icon, footer, small, valueColor }: {
  anim: number; label: string; value: string | number; color: string; bg: string; icon: string; footer: React.ReactNode; small?: boolean; valueColor?: string;
}) {
  return (
    <div className={`kpi-card anim-card-${anim} bg-white p-5 rounded-xl border border-slate-200 relative overflow-hidden`}>
      <div style={{ position: "absolute", right: -16, bottom: -16, width: 80, height: 80, background: bg, borderRadius: "50%", opacity: 0.5 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="kpi-icon w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
          <svg className="w-5 h-5" style={{ color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
        </div>
        <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: small ? "1.25rem" : "1.5rem", color: valueColor || "#1e293b", marginTop: "0.25rem" }}>{value}</p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
          {footer}
        </div>
      </div>
    </div>
  );
}
