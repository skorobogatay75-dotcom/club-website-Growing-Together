import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Восстановление пароля",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <ForgotPasswordForm />
      <p className="text-center text-sm">
        <Link href="/admin/login" className="text-accent hover:text-accent-hover">
          ← Ко входу
        </Link>
      </p>
    </div>
  );
}
