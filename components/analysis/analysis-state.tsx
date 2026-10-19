import { Alert } from "@/components/ui/alert";

export function AnalysisState({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warning" | "error" }) { return <Alert className={tone === "error" ? "border-[#ff9a91]/25 bg-[#ff9a91]/[0.08] text-[#ffd0cb]" : tone === "warning" ? "border-[#f0b96a]/25 bg-[#f0b96a]/[0.08] text-[#f3d39c]" : "border-white/[0.08] bg-[#161e27] text-[#c5d0da]"}>{children}</Alert>; }
