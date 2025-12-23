
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { PrintInvoiceProps } from "./PrintInvoice";

const styles = StyleSheet.create({
  page: { backgroundColor: "#fff", padding: 40, fontSize: 12, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logo: { height: 48, marginRight: 16 },
  companyBlock: { flex: 1 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 2 },
  info: { fontSize: 10, color: "#444" },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  section: { flex: 1 },
  sectionTitle: { fontWeight: 600, marginBottom: 2 },
  table: { width: "100%", marginBottom: 24 },
  tableHeader: { flexDirection: "row", borderBottom: "1pt solid #e5e7eb", backgroundColor: "#f3f4f6" },
  tableCell: { flex: 1, padding: 6, fontSize: 12 },
  tableRow: { flexDirection: "row", borderBottom: "1pt solid #e5e7eb" },
  totals: { marginBottom: 12, fontSize: 12 },
  totalDue: { fontSize: 14, fontWeight: 700, marginTop: 2 },
  paid: { color: "#16a34a", fontWeight: 700 },
  unpaid: { color: "#dc2626", fontWeight: 700 },
  notes: { marginTop: 10, fontSize: 11, color: "#666" },
  footer: { marginTop: 32, textAlign: "center", color: "#888", fontSize: 11 },
});

export function InvoicePDF({ invoice }: PrintInvoiceProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            {invoice.company.logoUrl && (
              <img src={invoice.company.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.title}>{invoice.company.name}</Text>
            <Text style={styles.info}>{invoice.company.address}</Text>
            <Text style={styles.info}>Phone: {invoice.company.phone}</Text>
            {invoice.company.fax && <Text style={styles.info}>Fax: {invoice.company.fax}</Text>}
            {invoice.company.website && <Text style={styles.info}>Website: {invoice.company.website}</Text>}
            <Text style={styles.info}>Email: {invoice.company.email}</Text>
            <Text style={styles.info}>Invoice ID: {invoice.id}</Text>
            <Text style={styles.info}>Date: {invoice.date}</Text>
            <Text style={styles.info}>Due: {invoice.dueDate}</Text>
          </View>
        </View>
        <View style={styles.sectionRow}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>From:</Text>
            <Text>{invoice.company.name}</Text>
            <Text>{invoice.company.address}</Text>
            <Text>{invoice.company.phone}</Text>
            <Text>{invoice.company.email}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text>{invoice.customer.name}</Text>
            <Text>{invoice.customer.address}</Text>
            <Text>{invoice.customer.phone}</Text>
            <Text>{invoice.customer.email}</Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Description</Text>
            <Text style={styles.tableCell}>Qty</Text>
            <Text style={styles.tableCell}>Price</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          {invoice.items.map((item, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>{item.price.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.totals}>
          <Text>Subtotal: {invoice.subtotal.toFixed(2)}</Text>
          <Text>Tax: {invoice.tax.toFixed(2)}</Text>
          <Text style={styles.totalDue}>Total: {invoice.total.toFixed(2)}</Text>
          <Text>Status: <Text style={invoice.paid ? styles.paid : styles.unpaid}>{invoice.paid ? "PAID" : "UNPAID"}</Text></Text>
        </View>
        {invoice.notes && <Text style={styles.notes}>Notes: {invoice.notes}</Text>}
        <Text style={styles.footer}>Thank you for your business!</Text>
      </Page>
    </Document>
  );
}
