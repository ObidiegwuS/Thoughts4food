"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CorrectionForm({ initialValue, onSave }: { initialValue: string; onSave: (value: string) => void }) { const [value, setValue] = useState(initialValue); return <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (value.trim()) onSave(value.trim()); }}><label htmlFor="correction-value" className="text-sm font-semibold">What should we call this food?</label><input id="correction-value" value={value} onChange={(event) => setValue(event.target.value)} className="min-h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3" /><Button type="submit">Save correction</Button></form>; }
