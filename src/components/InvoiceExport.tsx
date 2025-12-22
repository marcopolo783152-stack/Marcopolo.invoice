"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";
import * as XLSX from "xlsx";

const columns = [
  "Invoice ID",
  "Customer Name",
  "Total",
  "Paid",
  "Date",
];

export default function InvoiceExport() {
  const { user, role } = useAuthWithRole();
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = role === "admin"
      ? query(collection(db, "invoices"))
      : query(collection(db, "invoices"), where("userId", "==", user.uid));
    getDocs(q).then((snap) => {
      setInvoices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [user, role]);

  const handleExport = () => {
    const data = invoices.map((inv) => [
      inv.id,
      inv.customer?.name,
      inv.total,
      inv.paid ? "Paid" : "Unpaid",
      inv.createdAt?.toDate?.().toLocaleDateString?.() || "-",
    ]);
    const ws = XLSX.utils.aoa_to_sheet([columns, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, "invoices.xlsx");
  };

  return (
    <div className="my-4">
      <button
        onClick={handleExport}
        className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
        disabled={invoices.length === 0}
      >
        Export Invoices (.xlsx)
      </button>
    </div>
  );
}
