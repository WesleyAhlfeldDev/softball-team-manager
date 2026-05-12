import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import DashboardNav from "./DashboardNav";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("app-session")?.value;

  if (!token) redirect("/login");

  try {
    await jwtVerify(token, secret);
  } catch {
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
