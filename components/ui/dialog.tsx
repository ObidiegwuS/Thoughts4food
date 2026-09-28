"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dialog({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) { if (!open) return null; return <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-5"><div className="w-full max-w-md rounded-2xl bg-[hsl(var(--card))] p-5 shadow-xl"><div className="flex items-center justify-between"><h2 id="dialog-title" className="text-lg font-semibold">{title}</h2><Button type="button" variant="ghost" size="sm" aria-label="Close dialog" onClick={onClose}><X size={18} aria-hidden="true" /></Button></div><div className="mt-4">{children}</div></div></div>; }
