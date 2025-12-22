"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";
import { DocumentCheckIcon, DocumentTextIcon, UserGroupIcon } from "@heroicons/react/24/outline";

export default function DashboardStats() {
  const { user, role } = useAuthWithRole();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    customers: 0,
  });

  useEffect(() => {
    if (!user) return;
    // Invoices
    const qInv = role === "admin"
      ? query(collection(db, "invoices"))
      : query(collection(db, "invoices"), where("userId", "==", user.uid));
    getDocs(qInv).then((snap) => {
      const invoices = snap.docs.map((doc) => doc.data());
      setStats((prev) => ({
        ...prev,
        totalInvoices: invoices.length,
        paidInvoices: invoices.filter((i) => i.paid).length,
        unpaidInvoices: invoices.filter((i) => !i.paid).length,
      }));
    });
    // Customers
    const qCust = role === "admin"
      ? query(collection(db, "addressBook"))
      : query(collection(db, "addressBook"), where("userId", "==", user.uid));
    getDocs(qCust).then((snap) => {
      setStats((prev) => ({ ...prev, customers: snap.docs.length }));
    });
  }, [user, role]);

  const statList = [
    {
      name: "Total Invoices",
      value: stats.totalInvoices,
      icon: DocumentTextIcon,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      name: "Paid Invoices",
      value: stats.paidInvoices,
      icon: DocumentCheckIcon,
      color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    },
    {
      name: "Unpaid Invoices",
      value: stats.unpaidInvoices,
      icon: DocumentTextIcon,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    },
    {
      name: "Customers",
      value: stats.customers,
      icon: UserGroupIcon,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statList.map((stat) => (
        <div
          key={stat.name}
          className={`flex items-center gap-4 p-6 rounded-xl shadow bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 ${stat.color}`}
        >
          <stat.icon className="w-8 h-8" />
          <div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm font-medium opacity-80">{stat.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
