"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * PageTransition — Wrapper animasi transisi antar halaman dashboard.
 * 
 * Memberikan efek fade-in + slide-up setiap kali pathname berubah (pindah menu).
 * Juga menampilkan progress bar di atas halaman selama transisi.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    if (pathname !== key) {
      // Mulai transisi: fade-out cepat
      setIsTransitioning(true);
      
      // Setelah fade-out selesai, ganti konten dan fade-in
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setKey(pathname);
        setIsTransitioning(false);
      }, 150); // 150ms fade-out

      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children, key]);

  return (
    <>
      {/* Progress Bar */}
      {isTransitioning && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          height: 3,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
          animation: "progressBar 1.5s ease-in-out infinite",
        }} />
      )}

      {/* Content dengan animasi */}
      <div
        key={key}
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "translateY(12px)" : "translateY(0)",
          transition: "opacity 0.25s ease-out, transform 0.3s ease-out",
          willChange: "opacity, transform",
        }}
      >
        {displayChildren}
      </div>
    </>
  );
}
