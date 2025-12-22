import { useState } from "react";

export default function AdminKeyModal({ onConfirm, onCancel }: { onConfirm: (key: string) => void, onCancel: () => void }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) {
      setError("Admin key required");
      return;
    }
    setError("");
    onConfirm(key);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow space-y-4 min-w-[300px]">
        <h2 className="text-xl font-bold">Admin Key Required</h2>
        <input
          type="password"
          className="p-3 border rounded w-full"
          placeholder="Enter admin key"
          value={key}
          onChange={e => setKey(e.target.value)}
          autoFocus
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
        </div>
      </form>
    </div>
  );
}
