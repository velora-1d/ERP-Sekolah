import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

async function getDashboardData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [
    students, employees, classrooms, ppdb,
    incomeThisMonth, expenseThisMonth,
    savingsDeposits, savingsWithdrawals, wakafIncome, tunggakan,
  ] = await Promise.all([
    prisma.student.findMany({ where: { deletedAt: null, status: "aktif" } }),
    prisma.employee.findMany({ where: { deletedAt: null, status: "aktif" } }),
    prisma.classroom.findMany({ where: { deletedAt: null } }),
    prisma.ppdbRegistration.findMany({ where: { deletedAt: null } }),
    prisma.generalTransaction.aggregate({ where: { type: "in", status: "valid", deletedAt: null, createdAt: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
    prisma.generalTransaction.aggregate({ where: { type: "out", status: "valid", deletedAt: null, createdAt: { gte: monthStart, lte: monthEnd } }, _sum: { amount: true } }),
    prisma.studentSaving.aggregate({ where: { type: "setor", status: "active", deletedAt: null }, _sum: { amount: true } }),
    prisma.studentSaving.aggregate({ where: { type: "tarik", status: "active", deletedAt: null }, _sum: { amount: true } }),
    prisma.generalTransaction.aggregate({ where: { type: "in", status: "valid", deletedAt: null, wakafDonorId: { not: null } }, _sum: { amount: true } }),
    prisma.infaqBill.findMany({ where: { status: "belum_lunas", deletedAt: null }, include: { student: { select: { gender: true } } } }),
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
  const siswaIdDenganTunggakan = new Set(tunggakan.map((t) => t.studentId));
  const lunasCount = students.filter((s) => !siswaIdDenganTunggakan.has(s.id)).length;
  const complianceRate = students.length > 0 ? Math.round((lunasCount / students.length) * 100) : 0;
  const compliancePa = students.filter((s) => s.gender === "L" && !siswaIdDenganTunggakan.has(s.id)).length;
  const compliancePi = students.filter((s) => s.gender === "P" && !siswaIdDenganTunggakan.has(s.id)).length;

  return {
    totalSiswa: students.length, totalSiswaPa, totalSiswaPi,
    totalGuru: guru.length, totalStaff: staf.length, totalKelas: classrooms.length,
    ppdbPending, ppdbDiterima,
    pemasukanBulanIni: incomeThisMonth._sum.amount || 0,
    pengeluaranBulanIni: expenseThisMonth._sum.amount || 0,
    saldoTabungan, totalWakaf: wakafIncome._sum.amount || 0,
    tunggakanTotal: tunggakan.length, tunggakanPa, tunggakanPi,
    complianceRate, compliancePa, compliancePi,
  };
}

function fmtRp(n: number) { return "Rp " + (n || 0).toLocaleString("id-ID"); }

export default async function DashboardPage() {
  const user = await getAuthUser();
  const data = await getDashboardData();

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-2xl overflow-hidden relative shadow-lg">
        <div className="absolute -right-5 -top-5 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-white">Halo, {user?.name || "Administrator"}!</h2>
              <p className="text-sm text-white/50 mt-0.5">Selamat datang di Panel Administrasi MI As-Saodah.</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Baris 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Siswa Aktif" value={data.totalSiswa} color="text-indigo-600" bg="bg-indigo-100" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          footer={<><span>Putra: <strong className="text-indigo-600">{data.totalSiswaPa}</strong></span><span>Putri: <strong className="text-amber-600">{data.totalSiswaPi}</strong></span></>} />
        <KpiCard label="Total Guru & Staff" value={data.totalGuru + data.totalStaff} color="text-violet-600" bg="bg-violet-100" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          footer={<><span>Guru: <strong className="text-violet-600">{data.totalGuru}</strong></span><span>Staff: <strong className="text-violet-400">{data.totalStaff}</strong></span></>} />
        <KpiCard label="Total Kelas Aktif" value={data.totalKelas} color="text-emerald-600" bg="bg-emerald-100" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          footer={<><span>Terdaftar: <strong className="text-emerald-600">{data.totalKelas}</strong></span><span>Siswa: <strong className="text-indigo-600">{data.totalSiswa}</strong></span></>} />
        <KpiCard label="Pendaftar PPDB" value={data.ppdbPending + data.ppdbDiterima} color="text-sky-600" bg="bg-sky-100" icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          footer={<><span>Pending: <strong className="text-sky-600">{data.ppdbPending}</strong></span><span>Diterima: <strong className="text-emerald-600">{data.ppdbDiterima}</strong></span></>} />
        <KpiCard label="Kepatuhan Lunas Infaq" value={`${data.complianceRate}%`} color="text-amber-600" bg="bg-amber-100" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          footer={<><span>PA: <strong className="text-emerald-600">{data.compliancePa}</strong></span><span>PI: <strong className="text-amber-600">{data.compliancePi}</strong></span></>} />
      </div>

      {/* KPI Baris 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Pemasukan Bulan Ini" value={fmtRp(data.pemasukanBulanIni)} color="text-emerald-600" bg="bg-emerald-100" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" small
          footer={<><span>Data Real</span><strong className="text-emerald-600">Bulan Ini</strong></>} />
        <KpiCard label="Pengeluaran Bulan Ini" value={fmtRp(data.pengeluaranBulanIni)} color="text-rose-600" bg="bg-rose-100" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" small valueColor="text-rose-600"
          footer={<><span>Data Real</span><strong className="text-rose-600">Bulan Ini</strong></>} />
        <KpiCard label="Total Saldo Tabungan" value={fmtRp(data.saldoTabungan)} color="text-cyan-600" bg="bg-cyan-100" icon="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" small
          footer={<><span>Seluruh Siswa</span><strong className="text-cyan-600">Akumulatif</strong></>} />
        <KpiCard label="Total Wakaf Masuk" value={fmtRp(data.totalWakaf)} color="text-amber-600" bg="bg-amber-100" icon="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" small
          footer={<><span>Penerimaan</span><strong className="text-amber-600">Akumulatif</strong></>} />
        <KpiCard label="Siswa Menunggak" value={data.tunggakanTotal} color="text-rose-600" bg="bg-rose-100" icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" valueColor="text-rose-600"
          footer={<><span>PA: <strong className="text-rose-600">{data.tunggakanPa}</strong></span><span>PI: <strong className="text-rose-600">{data.tunggakanPi}</strong></span></>} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, bg, icon, footer, small, valueColor }: {
  label: string; value: string | number; color: string; bg: string; icon: string; footer: React.ReactNode; small?: boolean; valueColor?: string;
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 relative overflow-hidden hover:shadow-md transition-shadow">
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-40 pointer-events-none" style={{ background: `var(--tw-gradient-stops, ${bg})` }}>
        <div className={`w-full h-full rounded-full ${bg}`} />
      </div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 ${bg}`}>
          <svg className={`w-5 h-5 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} /></svg>
        </div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className={`font-heading font-extrabold mt-0.5 ${small ? "text-lg" : "text-xl"} ${valueColor || "text-slate-800"}`}>{value}</p>
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">{footer}</div>
      </div>
    </div>
  );
}
