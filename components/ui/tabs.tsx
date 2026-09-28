"use client";

import { useState } from "react";

export function Tabs({ tabs }: { tabs: Array<{ label: string; content: React.ReactNode }> }) { const [active, setActive] = useState(0); return <div><div role="tablist" className="flex gap-2 border-b border-[hsl(var(--border))]">{tabs.map((tab, index) => <button key={tab.label} type="button" role="tab" aria-selected={active === index} className="border-b-2 px-3 py-2 text-sm aria-selected:border-[hsl(var(--primary))]" onClick={() => setActive(index)}>{tab.label}</button>)}</div><div className="pt-4">{tabs[active]?.content}</div></div>; }
