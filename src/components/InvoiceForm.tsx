"use client";

import { useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";
import { calculateInvoice, InvoiceMode, InvoiceItem } from "@/lib/calculations";

const makeDefaultItem = () => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  quantity: 1,
  pricePerSqFt: 0,
  fixedPrice: 0,
  widthFeet: 0,
  widthInches: 0,
  lengthFeet: 0,
  lengthInches: 0,
});

export default function InvoiceForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuthWithRole();
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "", email: "" });
  const [items, setItems] = useState([makeDefaultItem()]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<InvoiceMode>("retail-per-sqft");
  const [discountPercentage, setDiscountPercentage] = useState(0);


  // Calculate invoice using the new engine
  const invoiceData = {
    invoiceNumber: "PREVIEW", // or generate as needed
    date: new Date().toISOString().slice(0, 10),
    terms: "Due on Receipt",
    soldTo: customer,
    items: items.map(item => ({ ...item, id: item.id || Math.random().toString(36).slice(2) })),
    mode,
    discountPercentage,
  };
  const calc = calculateInvoice(invoiceData);

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) => prev.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => setItems((prev) => [...prev, makeDefaultItem()]);
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
        mode,
        discountPercentage,
        subtotal: calc.subtotal,
        discount: calc.discount,
        subtotalAfterDiscount: calc.subtotalAfterDiscount,
        salesTax: calc.salesTax,
        totalDue: calc.totalDue,
        notes,
        paid: false,
        createdAt: Timestamp.now(),
        signature: signatureData,
      });
      setCustomer({ name: "", address: "", phone: "", email: "" });
      setItems([makeDefaultItem()]);
      setNotes("");
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  // Signature pad state
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Simple signature pad using canvas
  const SignaturePad = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const lastXRef = useRef(0);
    const lastYRef = useRef(0);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      drawingRef.current = true;
      const rect = e.currentTarget.getBoundingClientRect();
      lastXRef.current = e.clientX - rect.left;
      lastYRef.current = e.clientY - rect.top;
    };
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.beginPath();
      ctx.moveTo(lastXRef.current, lastYRef.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastXRef.current = x;
      lastYRef.current = y;
    };
    const stopDrawing = () => {
      drawingRef.current = false;
    };
    const clear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    };
    const save = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      setSignatureData(canvas.toDataURL());
    };
    return (
      <div className="my-4">
        <label className="block mb-2 font-semibold">Customer Signature:</label>
        <canvas
          ref={canvasRef}
          width={300}
          height={100}
          style={{ border: "1px solid #ccc", background: "#fff" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={clear} className="px-2 py-1 bg-gray-200 rounded">Clear</button>
          <button type="button" onClick={save} className="px-2 py-1 bg-blue-200 rounded">Save Signature</button>
        </div>
        {signatureData && <img src={signatureData} alt="Signature preview" className="mt-2 border" style={{ maxWidth: 300, maxHeight: 100 }} />}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Business Mode</label>
        <select
          className="p-2 border rounded"
          value={mode}
          onChange={e => setMode(e.target.value as InvoiceMode)}
        >
          <option value="retail-per-sqft">Retail - Per Sq.Ft</option>
          <option value="wholesale-per-sqft">Wholesale - Per Sq.Ft</option>
          <option value="retail-per-rug">Retail - Per Rug</option>
          <option value="wholesale-per-rug">Wholesale - Per Rug</option>
        </select>
      </div>
      {mode.startsWith("retail") && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">Discount (%)</label>
          <input
            type="number"
            className="p-2 border rounded"
            value={discountPercentage}
            min={0}
            max={100}
            onChange={e => setDiscountPercentage(Number(e.target.value))}
          />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input className="p-3 border rounded" placeholder="Customer Name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} required />
        <input className="p-3 border rounded" placeholder="Customer Email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} required />
        <input className="p-3 border rounded" placeholder="Customer Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
        <input className="p-3 border rounded" placeholder="Customer Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Items</h3>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2 flex-wrap items-end">
            <input className="p-2 border rounded flex-1" placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} required />
            {mode.endsWith("per-sqft") && (
              <>
                <input className="p-2 border rounded w-20" type="number" min={0} placeholder="Width (ft)" value={item.widthFeet} onChange={e => handleItemChange(idx, "widthFeet", +e.target.value)} required />
                <input className="p-2 border rounded w-20" type="number" min={0} placeholder="Width (in)" value={item.widthInches} onChange={e => handleItemChange(idx, "widthInches", +e.target.value)} required />
                <input className="p-2 border rounded w-20" type="number" min={0} placeholder="Length (ft)" value={item.lengthFeet} onChange={e => handleItemChange(idx, "lengthFeet", +e.target.value)} required />
                <input className="p-2 border rounded w-20" type="number" min={0} placeholder="Length (in)" value={item.lengthInches} onChange={e => handleItemChange(idx, "lengthInches", +e.target.value)} required />
                <input className="p-2 border rounded w-28" type="number" min={0} step={0.01} placeholder="Price/Sq.Ft" value={item.pricePerSqFt} onChange={e => handleItemChange(idx, "pricePerSqFt", +e.target.value)} required />
              </>
            )}
            {mode.endsWith("per-rug") && (
              <input className="p-2 border rounded w-28" type="number" min={0} step={0.01} placeholder="Fixed Price" value={item.fixedPrice} onChange={e => handleItemChange(idx, "fixedPrice", +e.target.value)} required />
            )}
            <input className="p-2 border rounded w-20" type="number" min={1} placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, "quantity", +e.target.value)} required />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)} className="text-red-500 font-bold px-2">×</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem} className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded">Add Item</button>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between"><span>Subtotal:</span><span>{calc.subtotal.toFixed(2)}</span></div>
        {mode.startsWith("retail") && (
          <>
            <div className="flex justify-between"><span>Discount:</span><span>{calc.discount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Subtotal After Discount:</span><span>{calc.subtotalAfterDiscount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Sales Tax (6%):</span><span>{calc.salesTax.toFixed(2)}</span></div>
          </>
        )}
        <div className="flex justify-between font-bold text-lg"><span>Total Due:</span><span>{calc.totalDue.toFixed(2)}</span></div>
      </div>
      <textarea className="p-3 border rounded w-full" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
      <SignaturePad />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition" disabled={loading}>
        {loading ? "Creating..." : "Create Invoice"}
      </button>
    </form>
  );
}
