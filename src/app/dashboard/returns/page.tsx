"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";

export default function ReturnsPage() {
  const { user, role } = useAuthWithRole();
  const [returns, setReturns] = useState<any[]>([]);
  const [form, setForm] = useState({ invoiceId: "", reason: "", amount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = role === "admin"
      ? query(collection(db, "returns"))
      : query(collection(db, "returns"), where("userId", "==", user.uid));
    getDocs(q).then((snap) => {
      setReturns(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [user, role]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!user) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      await addDoc(collection(db, "returns"), {
        ...form,
        amount: Number(form.amount),
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      setForm({ invoiceId: "", reason: "", amount: 0 });
      // Refresh list
      const q = role === "admin"
        ? query(collection(db, "returns"))
        : query(collection(db, "returns"), where("userId", "==", user.uid));
      getDocs(q).then((snap) => {
        setReturns(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    } catch (err: any) {
      setError(err.message || "Failed to create return/credit note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow max-w-2xl mx-auto mt-8 space-y-4">
        <h2 className="text-2xl font-bold mb-2">Create Return / Credit Note</h2>
        <input name="invoiceId" className="p-3 border rounded w-full" placeholder="Invoice ID" value={form.invoiceId} onChange={handleChange} required />
        <input name="reason" className="p-3 border rounded w-full" placeholder="Reason" value={form.reason} onChange={handleChange} required />
        <input name="amount" className="p-3 border rounded w-full" type="number" min={0} step={0.01} placeholder="Amount" value={form.amount} onChange={handleChange} required />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition" disabled={loading}>
          {loading ? "Creating..." : "Create Return / Credit Note"}
        </button>
      </form>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Returns / Credit Notes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                <th className="p-2">Invoice ID</th>
                <th className="p-2">Reason</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.invoiceId}</td>
                  <td className="p-2">{r.reason}</td>
                  <td className="p-2">{r.amount}</td>
                  <td className="p-2">{r.createdAt?.toDate?.().toLocaleDateString?.() || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
