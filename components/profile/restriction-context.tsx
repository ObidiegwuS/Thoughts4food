"use client";

import { createContext, useContext, useState } from "react";

const RestrictionContext = createContext<{ restrictions: string[]; setRestrictions: (value: string[]) => void }>({ restrictions: [], setRestrictions: () => undefined });
export function RestrictionProvider({ children }: { children: React.ReactNode }) { const [restrictions, setRestrictions] = useState<string[]>([]); return <RestrictionContext.Provider value={{ restrictions, setRestrictions }}>{children}</RestrictionContext.Provider>; }
export function useRestrictions() { return useContext(RestrictionContext); }
