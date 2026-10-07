"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Shield, User, UserCheck } from "lucide-react";
import { adminSetUserRole } from "./actions";

interface AdminUserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    age: number | null;
    address: string | null;
    _count: { polls: number; votes: number };
  };
  currentUserRole: string;
  isSelf: boolean;
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MODERATOR: "bg-amber-100 text-amber-700",
  USER: "bg-slate-100 text-slate-600",
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  ADMIN: <Shield className="h-3 w-3" />,
  MODERATOR: <UserCheck className="h-3 w-3" />,
  USER: <User className="h-3 w-3" />,
};
export default function AdminUserRow({ user, currentUserRole, isSelf }: AdminUserRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const handleRoleChange = (newRole: string) => {
    setError(null);
    startTransition(async () => {
      const res = await adminSetUserRole(user.id, newRole);
      if (!res.success) setError(res.error || "Failed.");
      else router.refresh();
    });
  };
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-3">
        <span className="font-semibold text-slate-800">{user.name || "—"}</span>
        <span className="block text-[11px] text-slate-400">{user.email}</span>
        {error && <span className="block text-[11px] text-red-500 mt-0.5">{error}</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${ROLE_STYLES[user.role] ?? ROLE_STYLES.USER}`}>{ROLE_ICONS[user.role]}{user.role}</span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        {user.age ? `${user.age} yrs` : "—"} · {user.address || "—"}
      </td>
      <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{user._count.polls}</td>
      <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{user._count.votes}</td>
      <td className="px-4 py-3 text-center">
        {currentUserRole === "ADMIN" && !isSelf ? (
          <select defaultValue={user.role} onChange={(e) => handleRoleChange(e.target.value)} disabled={isPending} className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 bg-white">
            <option value="USER">USER</option>
            <option value="MODERATOR">MODERATOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        ) : (
          <span className="text-[11px] text-slate-300">{isSelf ? "You" : "Read-only"}</span>
        )}
      </td>
    </tr>
  );
}
