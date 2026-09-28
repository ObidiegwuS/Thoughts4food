import { LoaderCircle } from "lucide-react";

export function AnalysisProgress() { return <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--muted))] p-4 text-sm"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /><span>Reading the image and checking what can be identified...</span></div>; }
