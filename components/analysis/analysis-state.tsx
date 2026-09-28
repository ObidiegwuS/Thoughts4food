import { Alert } from "@/components/ui/alert";

export function AnalysisState({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warning" | "error" }) { return <Alert className={tone === "error" ? "border-red-300 bg-red-50 text-red-950" : tone === "warning" ? "border-amber-300 bg-amber-50 text-amber-950" : "bg-white/60"}>{children}</Alert>; }
