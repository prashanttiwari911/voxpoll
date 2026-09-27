"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { markNotificationsRead } from "@/app/actions/user";
import { CheckCheck } from "lucide-react";

export default function MarkReadButton({ notificationIds }: { notificationIds: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => {
        await markNotificationsRead(notificationIds);
        router.refresh();
      })}
      disabled={isPending}
      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
    >
      <CheckCheck className="h-3.5 w-3.5" />
      {isPending ? "Marking..." : "Mark all read"}
    </button>
  );
}
