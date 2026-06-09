import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { AccountSettings } from "./AccountSettings";

export const metadata: Metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });
  if (!user) redirect("/login");

  const providers = new Set(user.accounts.map((a) => a.provider));

  return (
    <div>
      <PageHeader eyebrow="Settings" title="Account" subtitle="Manage your login and profile" />
      <AccountSettings
        name={user.name ?? ""}
        email={user.email}
        hasPassword={!!user.passwordHash}
        connected={{ google: providers.has("google"), facebook: providers.has("facebook") }}
      />
    </div>
  );
}
