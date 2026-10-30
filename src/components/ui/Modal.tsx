"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

export function Modal({ title, children, onClose, className = "", dismissible = true, bare = false }: { title: string; children: ReactNode; onClose: () => void; className?: string; dismissible?: boolean; bare?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className={`modal ${className}`} aria-label={title} onCancel={(event) => { event.preventDefault(); if (dismissible) onClose(); }}>
    {!bare && <div className="modal-top"><span className="eyebrow">AGÊNCIA DE PRESERVAÇÃO TEMPORAL</span>{dismissible && <button className="icon-button" onClick={onClose} aria-label="Fechar"><Icon name="close" /></button>}</div>}
    {children}
  </dialog>;
}
