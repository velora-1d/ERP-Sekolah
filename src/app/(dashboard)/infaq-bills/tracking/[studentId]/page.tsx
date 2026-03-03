"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InfaqTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.studentId as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/infaq-bills/tracking/${studentId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setData(j.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  const monthNames: Record<string, string> = {
    "1": "Januari", "2": "Februari", "3": "Maret", "4": "April",
    "5": "Mei", "6": "Juni", "7": "Juli", "8": "Agustus",
    "9": "September", "10": "Oktober", "11": "November", "12": "Desember",
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      lunas: { bg: "#dcfce7", text: "#166534" },
      belum_lunas: { bg: "#fef9c3", text: "#854d0e" },
      sebagian: { bg: "#dbeafe", text: "#1e40af" },
      void: { bg: "#fecaca", text: "#991b1b" },
    };
    const c = colors[status] || { bg: "#f1f5f9", text: "#475569" };
    return (
      <span style={{ display: "inline-block", padding: "0.125rem 0.5rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, backgroundColor: c.bg, color: c.text }}>
        {status === "belum_lunas" ? "Belum Lunas" : status === "lunas" ? "Lunas" : status === "sebagian" ? "Sebagian" : status?.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Memuat...</div>;
  if (!data) return <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>Data tidak ditemukan</div>;

  const summary = data.summary || {};

  return (
    <div style={{ padding: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#64748b" }}>← </button>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Tracking Infaq/SPP — {data.student?.name || "Siswa"}
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>
            Kelas: {data.student?.classroom || "-"} | NISN: {data.student?.nisn || "-"}
          </p>
        </div>
      </div>

      {/* Ringkasan */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total Kewajiban", value: summary.totalKewajiban || 0, color: "#6366f1" },
          { label: "Total Terbayar", value: summary.totalTerbayar || 0, color: "#22c55e" },
          { label: "Sisa Tunggakan", value: summary.totalTunggakan || 0, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "1rem", borderRadius: "0.75rem", background: "#fff", border: "1px solid #e2e8f0" }}>
            <p style={{ fontSize: "0.6875rem", color: "#64748b", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: s.color, margin: "0.25rem 0 0" }}>Rp {Number(s.value).toLocaleString("id-ID")}</p>
          </div>
        ))}
      </div>

      {/* Tabel 12 Bulan */}
      <div style={{ background: "#fff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Bulan</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Nominal</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Terbayar</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Sisa</th>
              <th style={{ padding: "0.75rem 1rem", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data.months || []).map((m: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "0.625rem 1rem", fontWeight: 500, color: "#1e293b" }}>{monthNames[String(m.month)] || `Bulan ${m.month}`}</td>
                <td style={{ padding: "0.625rem 1rem", textAlign: "right", color: "#475569" }}>
                  {m.billId ? `Rp ${Number(m.nominal).toLocaleString("id-ID")}` : <span style={{ color: "#cbd5e1" }}>—</span>}
                </td>
                <td style={{ padding: "0.625rem 1rem", textAlign: "right", color: m.totalPaid > 0 ? "#22c55e" : "#cbd5e1" }}>
                  {m.totalPaid > 0 ? `Rp ${Number(m.totalPaid).toLocaleString("id-ID")}` : "—"}
                </td>
                <td style={{ padding: "0.625rem 1rem", textAlign: "right", color: m.remaining > 0 ? "#ef4444" : "#cbd5e1" }}>
                  {m.remaining > 0 ? `Rp ${Number(m.remaining).toLocaleString("id-ID")}` : "—"}
                </td>
                <td style={{ padding: "0.625rem 1rem", textAlign: "center" }}>
                  {m.status ? statusBadge(m.status) : <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>Belum digenerate</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
