import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";

export default function ReturnForm({ invoiceId, onCreated }: { invoiceId: string; onCreated?: () => void }) {
  const { user, role } = useAuthWithRole();
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch invoice items
    const fetchInvoice = async () => {
      const q = query(collection(db, "invoices"), where("id", "==", invoiceId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setItems(snap.docs[0].data().items || []);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handleItemChange = (idx: number, field: string, value: any) => {
    setSelectedItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = (item: any) => {
    setSelectedItems((prev) => [...prev, { ...item, returnQty: 1 }]);
  };
  const removeItem = (idx: number) => setSelectedItems((prev) => prev.filter((_, i) => i !== idx));

  const total = selectedItems.reduce((sum, i) => sum + i.returnQty * i.price, 0) * -1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "returns"), {
        invoiceId,
        userId: user?.uid,
        items: selectedItems,
        total,
        reason,
        createdAt: Timestamp.now(),
        processedBy: user?.email,
      });
      setSelectedItems([]);
      setReason("");
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create return");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "admin") return <div className="text-red-600">Only admins can process returns.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create Return / Credit Note</h2>
      <div>
        <h3 className="font-semibold mb-2">Select Items to Return</h3>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2 items-center">
            <span className="flex-1">{item.description} (Qty: {item.quantity})</span>
            <button type="button" onClick={() => addItem(item)} className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Add</button>
          </div>
        ))}
      </div>
      {selectedItems.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Return Details</h3>
          {selectedItems.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <span className="flex-1">{item.description}</span>
              <input type="number" min={1} max={item.quantity} value={item.returnQty} onChange={e => handleItemChange(idx, "returnQty", +e.target.value)} className="w-20 p-2 border rounded" />
              <span>@ {item.price.toFixed(2)}</span>
              <button type="button" onClick={() => removeItem(idx)} className="text-red-500 font-bold px-2">×</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between font-bold text-lg"><span>Total Return:</span><span>{total.toFixed(2)}</span></div>
      </div>
      <textarea className="p-3 border rounded w-full" placeholder="Reason for return" value={reason} onChange={e => setReason(e.target.value)} required />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition" disabled={loading || selectedItems.length === 0}>
        {loading ? "Processing..." : "Create Return"}
      </button>
    </form>
  );
}
