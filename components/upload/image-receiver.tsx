"use client";

import { ChangeEvent, useRef } from "react";
import { Camera, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageReceiverProps { disabled?: boolean; onSelect: (file: File) => void; }

export function ImageReceiver({ disabled, onSelect }: ImageReceiverProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChange = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) onSelect(file); event.target.value = ""; };
  return <div className="flex flex-wrap gap-3">
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onChange} disabled={disabled} />
    <Button type="button" size="lg" onClick={() => inputRef.current?.click()} disabled={disabled}><ImagePlus size={18} aria-hidden="true" /> Choose a food image</Button>
    <Button type="button" size="lg" variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled}><Camera size={18} aria-hidden="true" /> Use camera</Button>
  </div>;
}
