import { Badge } from "@campusdash/ui";

const toneByStatus: Record<string, "default" | "success" | "warning" | "danger"> = {
  PENDING: "warning",
  ASSIGNED: "warning",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "danger"
};

export function StatusBadge({ status }: { status: string }) {
  const tone = toneByStatus[status] ?? "default";
  return <Badge tone={tone}>{status.replace("_", " ")}</Badge>;
}
