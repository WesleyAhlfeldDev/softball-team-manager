import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const hasSession =
    !!cookieStore.get("__Secure-authjs.session-token") ||
    !!cookieStore.get("authjs.session-token");

  if (!hasSession) {
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
