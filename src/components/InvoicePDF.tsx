import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PrintInvoiceProps } from "./PrintInvoice";

const styles = StyleSheet.create({
  page: { backgroundColor: "#fff", padding: 32, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
  label: { fontWeight: 700 },
  table: { display: "table", width: "auto", marginVertical: 8 },
  row: { flexDirection: "row" },
  cell: { flex: 1, padding: 4, borderBottom: "1pt solid #eee" },
});

export function InvoicePDF({ invoice }: PrintInvoiceProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>INVOICE</Text>
          <Text>Invoice ID: {invoice.id}</Text>
          <Text>Date: {invoice.date}</Text>
          <Text>Due: {invoice.dueDate}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>From:</Text>
          <Text>{invoice.company.name}</Text>
          <Text>{invoice.company.address}</Text>
          <Text>{invoice.company.phone}</Text>
          <Text>{invoice.company.email}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Bill To:</Text>
          <Text>{invoice.customer.name}</Text>
          <Text>{invoice.customer.address}</Text>
          <Text>{invoice.customer.phone}</Text>
          <Text>{invoice.customer.email}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={styles.cell}>Description</Text>
            <Text style={styles.cell}>Qty</Text>
            <Text style={styles.cell}>Price</Text>
            <Text style={styles.cell}>Total</Text>
          </View>
          {invoice.items.map((item, idx) => (
            <View style={styles.row} key={idx}>
              <Text style={styles.cell}>{item.description}</Text>
              <Text style={styles.cell}>{item.quantity}</Text>
              <Text style={styles.cell}>{item.price.toFixed(2)}</Text>
              <Text style={styles.cell}>{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text>Subtotal: {invoice.subtotal.toFixed(2)}</Text>
          <Text>Tax: {invoice.tax.toFixed(2)}</Text>
          <Text>Total: {invoice.total.toFixed(2)}</Text>
          <Text>Status: {invoice.paid ? "PAID" : "UNPAID"}</Text>
        </View>
        {invoice.notes && <Text>Notes: {invoice.notes}</Text>}
        <View style={{ marginTop: 32 }}>
          <Text style={{ textAlign: "center", color: "#888" }}>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
}
