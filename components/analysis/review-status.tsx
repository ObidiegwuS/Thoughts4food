import { Badge } from "@/components/ui/badge";
import type { ReviewStatus } from "@/lib/analysis/types";

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) { return <Badge className={status === "unreviewed" ? "bg-amber-100 text-amber-950" : "bg-emerald-100 text-emerald-950"}>{status === "unreviewed" ? "Needs your review" : status === "corrected" ? "Corrected by you" : "Confirmed by you"}</Badge>; }
