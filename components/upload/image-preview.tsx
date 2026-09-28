import Image from "next/image";

export function ImagePreview({ src, alt }: { src: string; alt: string }) { return <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--muted))]"><Image src={src} alt={alt} fill unoptimized className="object-cover" /></div>; }
