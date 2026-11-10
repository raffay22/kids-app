"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import MotionPressable from "@/components/MotionPressable";

type LogoutButtonProps = {
  className?: string;
  compact?: boolean;
  onNavigate?: () => void;
};

export default function LogoutButton({ className = "", compact = false, onNavigate }: LogoutButtonProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    onNavigate?.();
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <MotionPressable
      onClick={handleLogout}
      ariaLabel="Log out"
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 ${className}`}
    >
      <LogOut className="h-5 w-5 shrink-0" aria-hidden />
      {!compact && <span>Log out</span>}
    </MotionPressable>
  );
}
