import { PrintInvoice, PrintInvoiceProps } from "@/components/PrintInvoice";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/InvoicePDF";

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

export default function InvoicePDFPage() {
  return (
    <div className="flex flex-col items-center py-8">
      <PDFDownloadLink
        document={<InvoicePDF invoice={sampleInvoice} />}
        fileName={`${sampleInvoice.id}.pdf`}
        className="px-6 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition mb-4"
      >
        {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
      </PDFDownloadLink>
      <div className="shadow-xl bg-white rounded-lg p-8 w-[210mm] min-h-[297mm]">
        <PrintInvoice invoice={sampleInvoice} />
      </div>
    </div>
  );
}
