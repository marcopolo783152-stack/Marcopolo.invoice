"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuthWithRole } from "@/lib/useAuthWithRole";

export default function UsersPage() {
  const { role } = useAuthWithRole();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role !== "admin") return;
    setLoading(true);
    getDocs(collection(db, "users")).then((snap) => {
      setUsers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }).catch((err) => {
      setError(err.message || "Failed to load users");
      setLoading(false);
    });
  }, [role]);

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    }
  };

  if (role !== "admin") return <div className="p-8 text-red-600">Access denied.</div>;
  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="min-w-full border rounded">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)} className="border rounded p-1">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
