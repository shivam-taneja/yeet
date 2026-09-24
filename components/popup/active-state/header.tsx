import { StatusPill } from "@/components/shared/status-pill";

export function ActiveStateHeader({
  active,
  linkedAccounts,
}: {
  active: boolean;
  linkedAccounts: number;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <StatusPill active={active} />
      <span className="text-xs font-semibold text-ink/50">
        {linkedAccounts} account{linkedAccounts !== 1 ? "s" : ""} linked
      </span>
    </div>
  );
}
