"use client";
import type { ReactNode } from "react";
import { useDialog } from "@/components/chrome/useDialog";
import { CloseIcon } from "@/components/chrome/Icons";

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  const ref = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="overlay overlay--center" onClick={onClose}>
      <div ref={ref} className={`modal${wide ? " modal--wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <h2 id="modal-title" className="serif modal__title">{title}</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
