import type { BadgeVariants } from "~/components/ui/badge";

export function outcomeBadgeVariant(outcome: string): BadgeVariants["variant"] {
  switch (outcome.toLowerCase()) {
    case "allow":
      return "default";
    case "block":
      return "destructive";
    case "throttle":
    case "pending":
      return "warning";
    default:
      return "outline";
  }
}
