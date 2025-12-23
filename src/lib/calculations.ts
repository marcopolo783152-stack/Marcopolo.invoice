// src/lib/calculations.ts
// Centralized business logic for all invoice modes and Excel-compatible calculations

export type InvoiceMode =
  | 'retail-per-rug'
  | 'wholesale-per-rug'
  | 'retail-per-sqft'
  | 'wholesale-per-sqft';

export interface InvoiceItem {
  id: string;
  sku?: string;
  description: string;
  widthFeet?: number;
  widthInches?: number;
  lengthFeet?: number;
  lengthInches?: number;
  pricePerSqFt?: number;
  fixedPrice?: number;
  quantity?: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  terms: string;
  soldTo: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
  };
  items: InvoiceItem[];
  mode: InvoiceMode;
  discountPercentage?: number;
}

export interface InvoiceResult {
  items: Array<InvoiceItem & { squareFoot?: number; amount: number }>;
  subtotal: number;
  discount: number;
  subtotalAfterDiscount: number;
  salesTax: number;
  totalDue: number;
}

const SALES_TAX_RATE = 0.06;

export function calculateSquareFoot(
  widthFeet = 0,
  widthInches = 0,
  lengthFeet = 0,
  lengthInches = 0
): number {
  return (
    (Number(widthFeet) + Number(widthInches) / 12) *
    (Number(lengthFeet) + Number(lengthInches) / 12)
  );
}

export function calculateInvoice(data: InvoiceData): InvoiceResult {
  const items = data.items.map((item) => {
    let squareFoot = 0;
    let amount = 0;
    if (data.mode.endsWith('per-sqft')) {
      squareFoot = calculateSquareFoot(
        item.widthFeet,
        item.widthInches,
        item.lengthFeet,
        item.lengthInches
      );
      amount = +(squareFoot * (item.pricePerSqFt || 0)).toFixed(2);
    } else {
      amount = +(item.fixedPrice || 0).toFixed(2);
    }
    if (item.quantity && item.quantity > 1) amount *= item.quantity;
    return { ...item, squareFoot, amount };
  });

  const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
  let discount = 0;
  let subtotalAfterDiscount = subtotal;
  let salesTax = 0;
  let totalDue = subtotal;

  if (data.mode.startsWith('retail')) {
    discount = +(subtotal * ((data.discountPercentage || 0) / 100)).toFixed(2);
    subtotalAfterDiscount = +(subtotal - discount).toFixed(2);
    salesTax = +(subtotalAfterDiscount * SALES_TAX_RATE).toFixed(2);
    totalDue = +(subtotalAfterDiscount + salesTax).toFixed(2);
  }

  return {
    items,
    subtotal,
    discount,
    subtotalAfterDiscount,
    salesTax,
    totalDue,
  };
}
