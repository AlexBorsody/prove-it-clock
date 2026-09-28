"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./compare-mode.module.css";

const MAX_SELECTED = 4;

export function useCompareSelection(ids: string[]) {
  const [stored, setStored] = useState<string[]>([]);
  const available = new Set(ids);
  const selected = stored.filter(id => available.has(id));
  function toggle(id: string) {
    if (!available.has(id)) return;
    setStored(previous => {
      const current = previous.filter(value => available.has(value));
      if (current.includes(id)) return current.filter(value => value !== id);
      return current.length < MAX_SELECTED ? [...current, id] : current;
    });
  }
  return {
    selected,
    toggle,
    clear: () => setStored([]),
    canSelect: (id: string) => available.has(id) && (selected.includes(id) || selected.length < MAX_SELECTED),
  };
}

export function CompareCheckbox({ name, checked, disabled, onChange }: {
  name: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return <label className={styles.checkbox} onClick={event => event.stopPropagation()}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} aria-label={`Compare ${name}`} />
    <span>Compare</span>
  </label>;
}

/** One modal shell for either market; the caller supplies its own table/data. */
export default function CompareMode({ selectedLabels, onClear, children }: {
  selectedLabels: string[];
  onClear: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const canCompare = selectedLabels.length >= 2;

  useEffect(() => {
    if (!canCompare) { setOpen(false); return; }
    if (!open) return;
    const element = dialog.current;
    if (!element) return;
    if (!element.open) element.showModal();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previousOverflow; };
  }, [open, canCompare]);

  if (!canCompare) return null;
  return <>
    <div className={styles.barSpace} aria-hidden="true" />
    <div className={styles.bar}>
      <span className={styles.selection}>{selectedLabels.join(" · ")}</span>
      <button type="button" className="btn" onClick={onClear}>Clear</button>
      <button ref={trigger} type="button" className="btn btn-primary" onClick={() => setOpen(true)}>Compare</button>
    </div>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId}
      onClose={() => { setOpen(false); trigger.current?.focus(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
      }}>
      <header className={styles.header}>
        <h2 id={titleId}>Compare</h2>
        <button type="button" className="btn" autoFocus onClick={() => dialog.current?.close()}>Close</button>
      </header>
      <div className={styles.body}>{open && children}</div>
    </dialog>
  </>;
}
