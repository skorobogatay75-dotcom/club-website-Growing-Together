import type { Metadata } from "next";
import Link from "next/link";
import { UpdatePasswordForm } from "@/components/admin/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Новый пароль",
};

export default function UpdatePasswordPage() {
  return (
    <div className="space-y-6">
      <UpdatePasswordForm />
      <p className="text-center text-sm">
        <Link href="/admin/login" className="text-accent hover:text-accent-hover">
          ← Ко входу
        </Link>
      </p>
    </div>
  );
}
