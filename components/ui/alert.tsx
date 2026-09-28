import * as React from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div role="status" className={cn("rounded-2xl border border-[hsl(var(--border))] p-4", className)} {...props} />; }
