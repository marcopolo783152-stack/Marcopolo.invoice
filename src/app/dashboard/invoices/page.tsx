"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";
import Link from "next/link";

export default function InvoicesList() {
  const { user, role } = useAuthWithRole();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = role === "admin"
      ? query(collection(db, "invoices"), orderBy("createdAt", "desc"))
      : query(collection(db, "invoices"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      setInvoices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, [user, role]);

  if (loading) return <div>Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/invoices/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">New Invoice</Link>
          {/* Excel export button */}
          <div className="inline-block"><(await import("@/components/InvoiceExport")).default /></div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800">
              <th className="p-2">ID</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="p-2 font-mono">{inv.id}</td>
                <td className="p-2">{inv.customer?.name}</td>
                <td className="p-2">{inv.total?.toFixed(2)}</td>
                <td className="p-2">{inv.paid ? <span className="text-green-600">Paid</span> : <span className="text-red-600">Unpaid</span>}</td>
                <td className="p-2">{inv.createdAt?.toDate?.().toLocaleDateString?.() || "-"}</td>
                <td className="p-2">
                  <Link href={`/dashboard/invoices/preview?id=${inv.id}`} className="text-blue-600 hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
