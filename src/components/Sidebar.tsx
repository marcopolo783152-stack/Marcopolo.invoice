import Link from "next/link";
import { ChartBarIcon, DocumentTextIcon, UsersIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon },
  { name: "Invoices", href: "/dashboard/invoices", icon: DocumentTextIcon },
  { name: "Returns", href: "/dashboard/returns", icon: ArrowLeftOnRectangleIcon },
  { name: "Address Book", href: "/dashboard/address-book", icon: UsersIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };
  return (
    <aside className="h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-6 text-2xl font-extrabold tracking-tight text-blue-700 dark:text-blue-400">
        InvoicePro
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-950 transition"
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleSignOut}
        className="m-4 flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition"
      >
        <ArrowLeftOnRectangleIcon className="w-5 h-5" />
        Sign Out
      </button>
    </aside>
  );
}
