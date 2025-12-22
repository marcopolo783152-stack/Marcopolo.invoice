import React from "react";

export interface PrintInvoiceProps {
  invoice: {
    id: string;
    date: string;
    dueDate: string;
    company: {
      name: string;
      address: string;
      phone: string;
      fax?: string;
      website?: string;
      email: string;
      logoUrl?: string;
    };
    customer: {
      name: string;
      address: string;
      phone: string;
      email: string;
    };
    items: Array<{
      description: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    paid: boolean;
    notes?: string;
  };
}

export const PrintInvoice = React.forwardRef<HTMLDivElement, PrintInvoiceProps>(({ invoice }, ref) => (
  <div ref={ref} className="bg-white text-black w-[210mm] min-h-[297mm] p-12 mx-auto rounded shadow-lg font-sans print:w-full print:min-h-0 print:rounded-none print:shadow-none">
    <div className="flex justify-between items-center mb-8">
      <div>
        <img src={invoice.company.logoUrl || "/marcopolo-logo.png"} alt="Company Logo" className="h-20 object-contain mb-2" />
        <h1 className="text-3xl font-bold mb-2">MARCO POLO ORIENTAL RUGS, INC.</h1>
        <div className="text-sm text-zinc-600">3260 DUKE ST</div>
        <div className="text-sm text-zinc-600">ALEXANDRIA, VA 22314</div>
        <div className="text-sm text-zinc-600">Phone: 703-461-0207</div>
        <div className="text-sm text-zinc-600">Fax: 703-461-0208</div>
        <div className="text-sm text-zinc-600">Website: www.marcopolorugs.com</div>
        <div className="text-sm text-zinc-600">Email: marcopolorugs@aol.com</div>
        <div className="text-sm text-zinc-600 mt-2">Invoice ID: {invoice.id}</div>
        <div className="text-sm text-zinc-600">Date: {invoice.date}</div>
        <div className="text-sm text-zinc-600">Due: {invoice.dueDate}</div>
      </div>
      {invoice.company.logoUrl && (
        <img src={invoice.company.logoUrl} alt="Company Logo" className="h-16 object-contain" />
      )}
    </div>
    <div className="flex justify-between mb-8">
      <div>
        <div className="font-semibold">From:</div>
        <div>{invoice.company.name}</div>
        <div>{invoice.company.address}</div>
        <div>{invoice.company.phone}</div>
        <div>{invoice.company.email}</div>
      </div>
      <div>
        <div className="font-semibold">Bill To:</div>
        <div>{invoice.customer.name}</div>
        <div>{invoice.customer.address}</div>
        <div>{invoice.customer.phone}</div>
        <div>{invoice.customer.email}</div>
      </div>
    </div>
    <table className="w-full mb-8 border-t border-b border-zinc-300">
      <thead>
        <tr className="text-left">
          <th className="py-2">Description</th>
          <th className="py-2">Qty</th>
          <th className="py-2">Price</th>
          <th className="py-2">Total</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item, idx) => (
          <tr key={idx} className="border-t border-zinc-200">
            <td className="py-2">{item.description}</td>
            <td className="py-2">{item.quantity}</td>
            <td className="py-2">{item.price.toFixed(2)}</td>
            <td className="py-2">{item.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="flex justify-end mb-2">
      <div className="w-64">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{invoice.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>{invoice.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mt-2">
          <span>Status:</span>
          <span className={invoice.paid ? "text-green-600" : "text-red-600"}>{invoice.paid ? "PAID" : "UNPAID"}</span>
        </div>
      </div>
    </div>
    {invoice.notes && (
      <div className="mt-8 text-sm text-zinc-600">Notes: {invoice.notes}</div>
    )}
    <div className="mt-16 text-xs text-zinc-400 text-center">Thank you for your business!</div>
  </div>
));
PrintInvoice.displayName = "PrintInvoice";
