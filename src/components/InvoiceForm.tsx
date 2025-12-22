import { useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";

const defaultItem = {
  description: "",
  quantity: 1,
  price: 0,
  shape: "Rectangular", // Rectangular or Round
  width: 0,
  length: 0,
  diameter: 0,
  area: 0,
};

export default function InvoiceForm({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuthWithRole();
  const [customer, setCustomer] = useState({ name: "", address: "", phone: "", email: "" });
  const [items, setItems] = useState([{ ...defaultItem }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invoiceType, setInvoiceType] = useState("Sale"); // Sale, Consignment, Wash


  // Calculate area for each item
  const calculateArea = (item: any) => {
    if (item.shape === "Rectangular") {
      // Area = width x length (convert inches to feet)
      const widthFt = Number(item.width) || 0;
      const lengthFt = Number(item.length) || 0;
      return +(widthFt * lengthFt).toFixed(2);
    } else if (item.shape === "Round") {
      // Area = π x (diameter/2)^2
      const diameterFt = Number(item.diameter) || 0;
      return +((Math.PI * Math.pow(diameterFt / 2, 2))).toFixed(2);
    }
    return 0;
  };

  // Update area when item changes
  const itemsWithArea = items.map((item) => ({
    ...item,
    area: calculateArea(item),
  }));

  const subtotal = itemsWithArea.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const tax = +(subtotal * 0.1).toFixed(2); // 10% tax for demo
  const total = +(subtotal + tax).toFixed(2);

  const handleItemChange = (idx: number, field: string, value: any) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      // Recalculate area if shape, width, length, or diameter changes
      if (["shape", "width", "length", "diameter"].includes(field)) {
        updated.area = calculateArea(updated);
      }
      return updated;
    }));
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
        items: itemsWithArea,
        subtotal,
        tax,
        total,
        notes,
        paid: false,
        createdAt: Timestamp.now(),
        signature: signatureData,
        type: invoiceType,
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
        <label className="block font-semibold mb-1">Invoice Type</label>
        <select
          className="p-2 border rounded"
          value={invoiceType}
          onChange={e => setInvoiceType(e.target.value)}
        >
          <option value="Sale">Sale</option>
          <option value="Consignment">Consignment</option>
          <option value="Wash">Wash</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input className="p-3 border rounded" placeholder="Customer Name" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} required />
        <input className="p-3 border rounded" placeholder="Customer Email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} required />
        <input className="p-3 border rounded" placeholder="Customer Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
        <input className="p-3 border rounded" placeholder="Customer Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Items</h3>
        {itemsWithArea.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2 flex-wrap items-end">
            <input className="p-2 border rounded flex-1" placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} required />
            <select className="p-2 border rounded" value={item.shape} onChange={e => handleItemChange(idx, "shape", e.target.value)}>
              <option value="Rectangular">Rectangular</option>
              <option value="Round">Round</option>
            </select>
            {item.shape === "Rectangular" ? (
              <>
                <input className="p-2 border rounded w-20" type="number" min={0} step={0.01} placeholder="Width (ft)" value={item.width} onChange={e => handleItemChange(idx, "width", +e.target.value)} required />
                <input className="p-2 border rounded w-20" type="number" min={0} step={0.01} placeholder="Length (ft)" value={item.length} onChange={e => handleItemChange(idx, "length", +e.target.value)} required />
              </>
            ) : (
              <input className="p-2 border rounded w-20" type="number" min={0} step={0.01} placeholder="Diameter (ft)" value={item.diameter} onChange={e => handleItemChange(idx, "diameter", +e.target.value)} required />
            )}
            <input className="p-2 border rounded w-20" type="number" min={1} placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, "quantity", +e.target.value)} required />
            <input className="p-2 border rounded w-28" type="number" min={0} step={0.01} placeholder="Price" value={item.price} onChange={e => handleItemChange(idx, "price", +e.target.value)} required />
            <span className="px-2">Area: {item.area} sq ft</span>
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
      <SignaturePad />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition" disabled={loading}>
        {loading ? "Creating..." : "Create Invoice"}
      </button>
    </form>
  );
}
