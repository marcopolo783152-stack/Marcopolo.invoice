import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";

const defaultItem = { description: "", quantity: 1, price: 0 };

export default function InvoiceForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuthWithRole();
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "", email: "" });
  const [items, setItems] = useState([{ ...defaultItem }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const tax = +(subtotal * 0.1).toFixed(2); // 10% tax for demo
  const total = +(subtotal + tax).toFixed(2);

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, { ...defaultItem }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addDoc(collection(db, "invoices"), {
        userId: user?.uid,
        customer,
        items,
        subtotal,
        tax,
        total,
        notes,
        paid: false,
        createdAt: Timestamp.now(),
      });
      setCustomer({ name: "", address: "", phone: "", email: "" });
      setItems([{ ...defaultItem }]);
      setNotes("");
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input className="p-3 border rounded" placeholder="Customer Name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} required />
        <input className="p-3 border rounded" placeholder="Customer Email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} required />
        <input className="p-3 border rounded" placeholder="Customer Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
        <input className="p-3 border rounded" placeholder="Customer Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Items</h3>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input className="p-2 border rounded flex-1" placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} required />
            <input className="p-2 border rounded w-20" type="number" min={1} placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, "quantity", +e.target.value)} required />
            <input className="p-2 border rounded w-28" type="number" min={0} step={0.01} placeholder="Price" value={item.price} onChange={e => handleItemChange(idx, "price", +e.target.value)} required />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)} className="text-red-500 font-bold px-2">×</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem} className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded">Add Item</button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between"><span>Subtotal:</span><span>{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax (10%):</span><span>{tax.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{total.toFixed(2)}</span></div>
      </div>
      <textarea className="p-3 border rounded w-full" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition" disabled={loading}>
        {loading ? "Creating..." : "Create Invoice"}
      </button>
    </form>
  );
}
