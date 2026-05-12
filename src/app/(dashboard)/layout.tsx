import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-surface-bg)" }}>
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
