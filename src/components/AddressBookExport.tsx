"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";
import * as XLSX from "xlsx";

const columns = [
  "First Name",
  "Last Name",
  "Address",
  "City",
  "State",
  "ZIP Code",
  "Phone Number",
  "Email",
];

export default function AddressBookExport() {
  const { user, role } = useAuthWithRole();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (role !== "admin") return;
    const q = query(collection(db, "addressBook"));
    getDocs(q).then((snap) => {
      // Remove duplicates by email or phone
      const seen = new Set();
      const unique = snap.docs
        .map((doc) => doc.data())
        .filter((c) => {
          const key = c.email + c.phone;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      setCustomers(unique);
    });
  }, [role]);

  const handleExport = () => {
    const data = customers.map((c) => [
      c.firstName,
      c.lastName,
      c.address,
      c.city,
      c.state,
      c.zip,
      c.phone,
      c.email,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([columns, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AddressBook");
    XLSX.writeFile(wb, "address-book.xlsx");
  };

  if (role !== "admin") return null;

  return (
    <div className="my-4">
      <button
        onClick={handleExport}
        className="px-6 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
        disabled={customers.length === 0}
      >
        Export Address Book (.xlsx)
      </button>
    </div>
  );
}
