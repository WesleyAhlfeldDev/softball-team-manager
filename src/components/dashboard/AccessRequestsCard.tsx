import { resolveAccessRequestAction } from "@/server/actions/access";

interface AccessRequestItem {
  id: string;
  name: string;
  email: string;
  message: string | null;
  createdAt: Date;
}

export function AccessRequestsCard({ requests }: { requests: AccessRequestItem[] }) {
  return (
    <div className="card mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="eyebrow">Beta access requests</div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{
            background: requests.length ? "var(--color-brand-dim)" : "var(--color-surface-input)",
            color: requests.length ? "var(--color-text-brand)" : "var(--color-text-muted)",
          }}
        >
          {requests.length} pending
        </span>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          No pending requests right now.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-lg p-3 md:flex-row md:items-start md:justify-between"
              style={{ background: "var(--color-surface-input)" }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {r.name}{" "}
                  <a
                    href={`mailto:${r.email}`}
                    className="font-normal"
                    style={{ color: "var(--color-text-brand)" }}
                  >
                    {r.email}
                  </a>
                </p>
                {r.message && (
                  <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {r.message}
                  </p>
                )}
                <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {new Date(r.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <form action={resolveAccessRequestAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="invited" />
                  <button
                    type="submit"
                    className="rounded-md px-3 py-1.5 text-xs font-bold"
                    style={{ background: "var(--color-brand-500)", color: "#07070f" }}
                  >
                    Mark invited
                  </button>
                </form>
                <form action={resolveAccessRequestAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value="declined" />
                  <button
                    type="submit"
                    className="rounded-md px-3 py-1.5 text-xs font-semibold"
                    style={{
                      background: "transparent",
                      border: "1px solid var(--color-border-default)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Dismiss
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
