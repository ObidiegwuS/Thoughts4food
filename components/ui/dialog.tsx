"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Dialog({ open, title, children, onClose, descriptionId }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void; descriptionId?: string }) {
	const titleId = useId();
	const dialogRef = useRef<HTMLDialogElement>(null);
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!open) return;
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (!dialog.open) dialog.showModal();
		return () => {
			if (dialog.open) dialog.close();
		};
	}, [open]);

	return <dialog ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onCloseRef.current(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={(event) => {
		if (event.key !== "Tab") return;
		const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}} className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#151b23] p-5 text-[#eff4f8] shadow-2xl backdrop:bg-black/70 sm:max-h-[calc(100dvh-3rem)] sm:p-6">
			<div className="flex items-start justify-between gap-4">
				<h2 id={titleId} className="text-lg font-semibold">{title}</h2>
				<Button type="button" variant="ghost" size="sm" aria-label="Close dialog" onClick={onClose}><X size={18} aria-hidden="true" /></Button>
			</div>
			<div className="mt-4">{children}</div>
	</dialog>;
}
