import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar user={{ name: user.name, role: user.role }} />
      <main className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: "#f8fafc" }}>
        <Header />
        <div className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
