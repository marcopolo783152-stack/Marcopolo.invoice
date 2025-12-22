import { PrintInvoice, PrintInvoiceProps } from "@/components/PrintInvoice";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const sampleInvoice: PrintInvoiceProps["invoice"] = {
  id: "INV-1001",
  date: "2025-12-22",
  dueDate: "2026-01-05",
  company: {
    name: "Acme Corp.",
    address: "123 Main St, City, State, ZIP",
    phone: "(555) 123-4567",
    email: "info@acme.com",
    logoUrl: "/logo.png",
  },
  customer: {
    name: "John Doe",
    address: "456 Elm St, City, State, ZIP",
    phone: "(555) 987-6543",
    email: "john@example.com",
  },
  items: [
    { description: "Product A", quantity: 2, price: 50, total: 100 },
    { description: "Service B", quantity: 1, price: 150, total: 150 },
  ],
  subtotal: 250,
  tax: 25,
  total: 275,
  paid: false,
  notes: "Payment due within 14 days.",
};

export default function InvoicePreviewPage() {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: sampleInvoice.id,
    removeAfterPrint: true,
  });

  return (
    <div className="flex flex-col items-center py-8">
      <div className="mb-4 flex gap-2">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition"
        >
          Print Invoice
        </button>
      </div>
      <div className="shadow-xl print:shadow-none bg-white print:bg-white rounded-lg print:rounded-none p-8 print:p-0 w-[210mm] min-h-[297mm]">
        <PrintInvoice ref={printRef} invoice={sampleInvoice} />
      </div>
    </div>
  );
}
