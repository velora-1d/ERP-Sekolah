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

      {/* Charts Section - 8 Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Distribusi Siswa Putra/Putri (Donut) */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Distribusi Siswa</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e0e7ff" strokeWidth="3.5" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="3.5" strokeDasharray={`${data.totalSiswa > 0 ? (data.totalSiswaPa / data.totalSiswa * 100) : 50} 100`} />
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.75rem", fontSize: "0.6875rem" }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#6366f1", marginRight: 4 }} />Putra: <strong>{data.totalSiswaPa}</strong></span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#e0e7ff", marginRight: 4 }} />Putri: <strong>{data.totalSiswaPi}</strong></span>
          </div>
        </div>

        {/* 2. Status PPDB (Bar) */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Status PPDB</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { label: "Pending", val: data.ppdbPending, color: "#f59e0b", bg: "#fef3c7" },
              { label: "Diterima", val: data.ppdbDiterima, color: "#10b981", bg: "#d1fae5" },
            ].map((b) => {
              const max = Math.max(data.ppdbPending, data.ppdbDiterima, 1);
              return (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#475569", marginBottom: 4 }}>
                    <span>{b.label}</span><strong>{b.val}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(b.val / max) * 100}%`, background: b.color, borderRadius: 6, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Arus Kas Bulan Ini */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Arus Kas Bulan Ini</p>
          {(() => {
            const maxKas = Math.max(data.pemasukanBulanIni, data.pengeluaranBulanIni, 1);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#475569", marginBottom: 4 }}>
                    <span>Masuk</span><strong style={{ color: "#10b981" }}>{fmtRp(data.pemasukanBulanIni)}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(data.pemasukanBulanIni / maxKas) * 100}%`, background: "linear-gradient(90deg,#10b981,#34d399)", borderRadius: 6 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#475569", marginBottom: 4 }}>
                    <span>Keluar</span><strong style={{ color: "#f43f5e" }}>{fmtRp(data.pengeluaranBulanIni)}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(data.pengeluaranBulanIni / maxKas) * 100}%`, background: "linear-gradient(90deg,#f43f5e,#fb7185)", borderRadius: 6 }} />
                  </div>
                </div>
                <div style={{ textAlign: "center", padding: "0.5rem", background: data.pemasukanBulanIni >= data.pengeluaranBulanIni ? "#ecfdf5" : "#fff1f2", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, color: data.pemasukanBulanIni >= data.pengeluaranBulanIni ? "#059669" : "#e11d48" }}>
                  Saldo: {fmtRp(data.pemasukanBulanIni - data.pengeluaranBulanIni)}
                </div>
              </div>
            );
          })()}
        </div>

        {/* 4. Komposisi SDM */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Komposisi SDM</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ede9fe" strokeWidth="3.5" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeDasharray={`${(data.totalGuru + data.totalStaff) > 0 ? (data.totalGuru / (data.totalGuru + data.totalStaff) * 100) : 50} 100`} />
            </svg>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.75rem", fontSize: "0.6875rem" }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#8b5cf6", marginRight: 4 }} />Guru: <strong>{data.totalGuru}</strong></span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#ede9fe", marginRight: 4 }} />Staff: <strong>{data.totalStaff}</strong></span>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 5. Kepatuhan SPP (Gauge) */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Kepatuhan SPP</p>
          <div style={{ position: "relative", display: "inline-block" }}>
            <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: "rotate(-90deg)" }}>
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke={data.complianceRate >= 80 ? "#10b981" : data.complianceRate >= 50 ? "#f59e0b" : "#f43f5e"} strokeWidth="3.5" strokeDasharray={`${data.complianceRate} 100`} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.125rem", color: "#1e293b" }}>{data.complianceRate}%</div>
          </div>
          <p style={{ fontSize: "0.6875rem", color: "#64748b", marginTop: "0.5rem" }}>Siswa lunas bulan ini</p>
        </div>

        {/* 6. Distribusi Tunggakan */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Distribusi Tunggakan</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { label: "Putra", val: data.tunggakanPa, color: "#6366f1" },
              { label: "Putri", val: data.tunggakanPi, color: "#f59e0b" },
            ].map((b) => {
              const max = Math.max(data.tunggakanPa, data.tunggakanPi, 1);
              return (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#475569", marginBottom: 4 }}>
                    <span>{b.label}</span><strong style={{ color: "#f43f5e" }}>{b.val} siswa</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(b.val / max) * 100}%`, background: b.color, borderRadius: 6 }} />
                  </div>
                </div>
              );
            })}
            <div style={{ textAlign: "center", padding: "0.5rem", background: "#fff1f2", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, color: "#e11d48", marginTop: "0.25rem" }}>
              Total: {data.tunggakanTotal} siswa
            </div>
          </div>
        </div>

        {/* 7. Tabungan vs Wakaf */}
        <div style={{ background: "#fff", borderRadius: "1rem", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Tabungan vs Wakaf</p>
          {(() => {
            const maxTW = Math.max(data.saldoTabungan, data.totalWakaf, 1);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#475569", marginBottom: 4 }}>
                    <span>Tabungan</span><strong style={{ color: "#06b6d4" }}>{fmtRp(data.saldoTabungan)}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(data.saldoTabungan / maxTW) * 100}%`, background: "linear-gradient(90deg,#06b6d4,#22d3ee)", borderRadius: 6 }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#475569", marginBottom: 4 }}>
                    <span>Wakaf</span><strong style={{ color: "#d97706" }}>{fmtRp(data.totalWakaf)}</strong>
                  </div>
                  <div style={{ height: 10, borderRadius: 6, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(data.totalWakaf / maxTW) * 100}%`, background: "linear-gradient(90deg,#d97706,#fbbf24)", borderRadius: 6 }} />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 8. Ringkasan Keuangan */}
        <div style={{ background: "linear-gradient(135deg,#312e81,#1e1b4b)", borderRadius: "1rem", padding: "1.25rem", color: "#fff" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Ringkasan Keuangan</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.7)" }}>Pemasukan</span>
              <strong style={{ fontSize: "0.875rem", color: "#34d399" }}>{fmtRp(data.pemasukanBulanIni)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.7)" }}>Pengeluaran</span>
              <strong style={{ fontSize: "0.875rem", color: "#fb7185" }}>{fmtRp(data.pengeluaranBulanIni)}</strong>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.1)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.7)" }}>Tabungan</span>
              <strong style={{ fontSize: "0.875rem", color: "#67e8f9" }}>{fmtRp(data.saldoTabungan)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.7)" }}>Wakaf</span>
              <strong style={{ fontSize: "0.875rem", color: "#fcd34d" }}>{fmtRp(data.totalWakaf)}</strong>
            </div>
          </div>
        </div>
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
