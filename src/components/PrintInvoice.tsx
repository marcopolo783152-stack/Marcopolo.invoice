
import React from "react";
import InvoiceTemplate, { InvoiceTemplateProps } from "./InvoiceTemplate";

export type { InvoiceTemplateProps as PrintInvoiceProps };

export const PrintInvoice = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ invoice }, ref) => (
  <InvoiceTemplate ref={ref} invoice={invoice} />
));
PrintInvoice.displayName = "PrintInvoice";
