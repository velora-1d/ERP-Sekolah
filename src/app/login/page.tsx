"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/dashboard";
      } else {
        setError(data.message || "Login gagal.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Kiri: Branding */}
      <div className="hidden lg:flex" style={{ width: "50%", background: "#312e81", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.2 }}>
          <svg style={{ height: "100%", width: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "3rem" }}>
          <div style={{ marginBottom: "2rem", display: "inline-block", padding: "1rem", background: "rgba(255,255,255,0.1)", borderRadius: "1rem", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <svg style={{ width: 96, height: 96, color: "#f59e0b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.25rem", fontWeight: 700, color: "#fff", margin: "0 0 1rem" }}>MI As-Saodah</h1>
          <p style={{ color: "#a5b4fc", fontSize: "1.125rem", maxWidth: "28rem", margin: "0 auto" }}>Sistem Informasi Terintegrasi Madrasah Ibtidaiyah. Kelola administrasi dengan mudah, cepat, dan transparan.</p>
        </div>
        <div style={{ position: "absolute", bottom: -96, left: -96, width: 256, height: 256, background: "rgba(99,102,241,0.2)", borderRadius: "50%", filter: "blur(48px)" }} />
        <div style={{ position: "absolute", top: -96, right: -96, width: 256, height: 256, background: "rgba(245,158,11,0.2)", borderRadius: "50%", filter: "blur(48px)" }} />
      </div>

      {/* Kanan: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{ background: "#f8fafc" }}>
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl" style={{ border: "1px solid #f1f5f9" }}>
          {/* Mobile logo */}
          <div className="text-center mb-10 lg:hidden">
            <svg style={{ width: 64, height: 64, color: "#f59e0b", margin: "0 auto 0.5rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 700, color: "#0f172a" }}>MI As-Saodah</h2>
          </div>

          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.875rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em" }}>Selamat Datang</h3>
          <p className="mt-2 text-sm text-slate-500">Silakan masuk ke akun Anda untuk melanjutkan akses dashboard.</p>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-[13px] text-rose-600 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={doLogin} className="mt-6">
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-1">Email / Username</label>
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" required autoComplete="username"
                className="block w-full px-4 py-3 rounded-xl border-[1.5px] border-slate-200 text-sm bg-slate-50 outline-none transition-colors focus:border-indigo-500" />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
                  className="block w-full px-4 py-3 pr-12 rounded-xl border-[1.5px] border-slate-200 text-sm bg-slate-50 outline-none transition-colors focus:border-indigo-500" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-0 right-0 bottom-0 flex items-center pr-4 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-60"
              style={{ background: "#1e1b4b" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#312e81")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#1e1b4b")}>
              {loading ? "Memproses..." : "Masuk Sekarang"}
            </button>
          </form>
          <p className="text-center text-xs text-slate-400 pt-8 font-medium">© 2026 MI As-Saodah. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </div>
  );
}
