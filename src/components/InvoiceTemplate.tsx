import React from "react";
import styles from "./InvoiceTemplate.module.css";

export interface InvoiceTemplateProps {
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

const InvoiceTemplate = React.forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ invoice }, ref) => (
  <div ref={ref} className={styles.invoiceWrapper}>
    <div className={styles.header}>
      <div className={styles.companyInfo}>
        <img src={invoice.company.logoUrl || "/marcopolo-logo.png"} alt="Company Logo" className={styles.logo} />
        <h1 className={styles.title}>{invoice.company.name}</h1>
        <div className={styles.address}>{invoice.company.address}</div>
        <div className={styles.phone}>Phone: {invoice.company.phone}</div>
        {invoice.company.fax && <div className={styles.fax}>Fax: {invoice.company.fax}</div>}
        {invoice.company.website && <div className={styles.website}>Website: {invoice.company.website}</div>}
        <div className={styles.email}>Email: {invoice.company.email}</div>
        <div className={styles.invoiceId}>Invoice ID: {invoice.id}</div>
        <div className={styles.date}>Date: {invoice.date}</div>
        <div className={styles.dueDate}>Due: {invoice.dueDate}</div>
      </div>
    </div>
    <div className={styles.sectionRow}>
      <div>
        <div className={styles.sectionTitle}>From:</div>
        <div>{invoice.company.name}</div>
        <div>{invoice.company.address}</div>
        <div>{invoice.company.phone}</div>
        <div>{invoice.company.email}</div>
      </div>
      <div>
        <div className={styles.sectionTitle}>Bill To:</div>
        <div>{invoice.customer.name}</div>
        <div>{invoice.customer.address}</div>
        <div>{invoice.customer.phone}</div>
        <div>{invoice.customer.email}</div>
      </div>
    </div>
    <table className={styles.itemsTable}>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item, idx) => (
          <tr key={idx}>
            <td>{item.description}</td>
            <td>{item.quantity}</td>
            <td>{item.price.toFixed(2)}</td>
            <td>{item.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className={styles.totals}>
      <div>Subtotal: {invoice.subtotal.toFixed(2)}</div>
      <div>Tax: {invoice.tax.toFixed(2)}</div>
      <div className={styles.totalDue}>Total: {invoice.total.toFixed(2)}</div>
      <div>Status: <span className={invoice.paid ? styles.paid : styles.unpaid}>{invoice.paid ? "PAID" : "UNPAID"}</span></div>
    </div>
    {invoice.notes && <div className={styles.notes}>Notes: {invoice.notes}</div>}
    <div className={styles.footer}>Thank you for your business!</div>
  </div>
));
InvoiceTemplate.displayName = "InvoiceTemplate";

export default InvoiceTemplate;
