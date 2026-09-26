"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/chrome-icons";
import {
  invalidateSearch,
  searchSections,
  searchSnippet,
  subscribeSearch,
  type SearchProgress,
  type SearchSection,
} from "@/lib/site-search";

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = [...new Set(query.trim().split(/\s+/).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .slice(0, 12)
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.join("|")})`, "gi");
  return <>{text.split(pattern).map((part, i) => i % 2 ? <mark key={i}>{part}</mark> : part)}</>;
}

/** Search tagged page sections and link directly to the matching content. */
export default function ProjectSearch({ paths }: { paths: string[] }) {
  const router = useRouter();
  const listId = useId();
  const statusId = useId();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [retry, setRetry] = useState(0);
  const [progress, setProgress] = useState<SearchProgress>({ sections: [], completed: 0, total: paths.length, failed: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    inputRef.current?.focus();
    return subscribeSearch(paths, setProgress);
  }, [expanded, paths, retry]);

  useEffect(() => {
    if (!expanded) return;
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) {
        setExpanded(false);
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [expanded]);

  const results = useMemo(() => searchSections(progress.sections, query), [progress.sections, query]);
  const selected = results.length ? Math.min(active, results.length - 1) : -1;
  const indexing = progress.completed < progress.total;

  useEffect(() => {
    if (!open || selected < 0) return;
    const list = listRef.current;
    const option = document.getElementById(`${listId}-${selected}`);
    if (!list || !option) return;
    // Scroll only the results pane, without moving the underlying page.
    const box = list.getBoundingClientRect();
    const row = option.getBoundingClientRect();
    if (row.bottom > box.bottom) list.scrollTop += row.bottom - box.bottom;
    else if (row.top < box.top) list.scrollTop -= box.top - row.top;
  }, [selected, open, listId, results.length]);

  function collapse(returnFocus = false) {
    setExpanded(false);
    setOpen(false);
    setQuery("");
    setActive(0);
    if (returnFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function go(section: SearchSection) {
    const destination = new URL(section.href, window.location.origin);
    const samePage = destination.pathname === window.location.pathname;
    collapse();
    router.push(section.href, { scroll: false });
    if (samePage) {
      // Selecting the same hash twice does not fire hashchange.
      window.dispatchEvent(new CustomEvent("site-search-navigate", { detail: destination.hash }));
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => Math.max(0, Math.min(value + 1, results.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === "Enter" && open && selected >= 0) {
      event.preventDefault();
      go(results[selected]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      collapse(true);
    }
  }

  if (!expanded) {
    return (
      <button
        ref={triggerRef}
        type="button"
        className="psearch-iconbtn"
        aria-label="Search site content"
        onClick={() => { setExpanded(true); setOpen(true); setActive(0); }}
      >
        <Icon name="search" size={20} />
      </button>
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="psearch psearch-expanded psearch-content"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <div className="psearch-box">
        <Icon name="search" size={17} />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search all site content"
          aria-label="Search all site content"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && selected >= 0 ? `${listId}-${selected}` : undefined}
          aria-describedby={open ? statusId : undefined}
          autoComplete="off"
          enterKeyHint="go"
          maxLength={200}
        />
        <button
          type="button"
          className="psearch-clear"
          aria-label={query ? "Clear search" : "Close search"}
          onClick={() => {
            if (query) { setQuery(""); setActive(0); inputRef.current?.focus(); }
            else collapse(true);
          }}
        >
          <Icon name="x" size={15} />
        </button>
      </div>
      {open ? (
        <div className="psearch-drop">
          <div className="psearch-status" id={statusId} role="status" aria-live="polite">
            <span>
              {query.trim() ? `${results.length} matching section${results.length === 1 ? "" : "s"}` : `${results.length} searchable sections`}
              {indexing ? " · Loading site index…" : ""}
              {progress.failed ? ` · ${progress.failed} page${progress.failed === 1 ? "" : "s"} unavailable` : ""}
              {progress.failed && !indexing ? <span className="psearch-coverage">Page coverage refreshes daily; reloading fetches the current saved index.</span> : null}
            </span>
            {progress.failed && !indexing ? (
              <button type="button" className="psearch-retry" onClick={() => { invalidateSearch(); setRetry((value) => value + 1); }}>Reload index</button>
            ) : null}
          </div>
          <div ref={listRef} className="psearch-results" role="listbox" id={listId} aria-label="Matching site sections" aria-busy={indexing}>
            {results.map((section, index) => (
              <a
                key={section.id}
                href={section.href}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === selected}
                tabIndex={-1}
                className={index === selected ? "psearch-row psearch-section active" : "psearch-row psearch-section"}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(event) => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) event.preventDefault(); }}
                onClick={(event) => {
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  go(section);
                }}
              >
                <span className="psearch-context">
                  {section.project ? <><Highlight text={section.project} query={query} /> · </> : null}
                  <Highlight text={section.kind} query={query} />
                </span>
                <span className="psearch-name"><Highlight text={section.title} query={query} /></span>
                <span className="psearch-snippet"><Highlight text={searchSnippet(section, query)} query={query} /></span>
              </a>
            ))}
          </div>
          {results.length === 0 ? (
            <div className="psearch-empty">{indexing ? "Searching page content…" : progress.failed ? "No matches in the available index. Missing pages are retried at the next daily refresh." : query.trim() ? "No matching sections. Try a project, promise, or topic." : "No searchable content is available yet."}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
