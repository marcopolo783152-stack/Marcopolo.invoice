"use client";
import { useAuthWithRole } from "@/lib/useAuthWithRole";
import DashboardStats from "@/components/DashboardStats";

export default function DashboardHome() {
  const { user, role } = useAuthWithRole();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Welcome to the Dashboard</h1>
      <DashboardStats />
      <div className="text-zinc-700 dark:text-zinc-300">
        Signed in as: <span className="font-semibold">{user?.email}</span>
      </div>
      <div className="text-zinc-700 dark:text-zinc-300">
        Role: <span className="font-semibold uppercase">{role}</span>
      </div>
      {/* TODO: Add recent activity, charts, etc. */}
    </div>
  );
}
