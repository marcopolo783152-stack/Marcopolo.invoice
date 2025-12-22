import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";

export default function AddressBook() {
  const { user, role } = useAuthWithRole();
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({ firstName: "", lastName: "", address: "", city: "", state: "", zip: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = role === "admin"
      ? query(collection(db, "addressBook"))
      : query(collection(db, "addressBook"), where("userId", "==", user.uid));
    getDocs(q).then((snap) => {
      setCustomers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
  }, [user, role]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Prevent duplicates by email or phone
      const q = query(collection(db, "addressBook"), where("email", "==", form.email));
      const snap = await getDocs(q);
      if (!snap.empty) throw new Error("Duplicate customer (email)");
      await addDoc(collection(db, "addressBook"), { ...form, userId: user?.uid });
      setForm({ firstName: "", lastName: "", address: "", city: "", state: "", zip: "", phone: "", email: "" });
      // Refresh list
      const q2 = role === "admin"
        ? query(collection(db, "addressBook"))
        : query(collection(db, "addressBook"), where("userId", "==", user.uid));
      getDocs(q2).then((snap) => {
        setCustomers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
    } catch (err: any) {
      setError(err.message || "Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow max-w-2xl mx-auto mt-8 space-y-4">
        <h2 className="text-2xl font-bold mb-2">Add Customer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="firstName" className="p-3 border rounded" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
          <input name="lastName" className="p-3 border rounded" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
          <input name="address" className="p-3 border rounded" placeholder="Address" value={form.address} onChange={handleChange} required />
          <input name="city" className="p-3 border rounded" placeholder="City" value={form.city} onChange={handleChange} required />
          <input name="state" className="p-3 border rounded" placeholder="State" value={form.state} onChange={handleChange} required />
          <input name="zip" className="p-3 border rounded" placeholder="ZIP Code" value={form.zip} onChange={handleChange} required />
          <input name="phone" className="p-3 border rounded" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
          <input name="email" className="p-3 border rounded" placeholder="Email" value={form.email} onChange={handleChange} required />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition" disabled={loading}>
          {loading ? "Adding..." : "Add Customer"}
        </button>
      </form>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Customer Directory</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800">
                <th className="p-2">First Name</th>
                <th className="p-2">Last Name</th>
                <th className="p-2">Address</th>
                <th className="p-2">City</th>
                <th className="p-2">State</th>
                <th className="p-2">ZIP</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.firstName}</td>
                  <td className="p-2">{c.lastName}</td>
                  <td className="p-2">{c.address}</td>
                  <td className="p-2">{c.city}</td>
                  <td className="p-2">{c.state}</td>
                  <td className="p-2">{c.zip}</td>
                  <td className="p-2">{c.phone}</td>
                  <td className="p-2">{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
