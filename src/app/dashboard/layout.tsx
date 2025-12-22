"use client";
import { useAuthWithRole } from "@/lib/useAuthWithRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuthWithRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !role)) {
      router.replace("/login");
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-lg text-zinc-500">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-row bg-gray-50 dark:bg-black">
      <Sidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
