"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import Icon from "@/components/chrome-icons";

export interface SearchProject {
  slug: string;
  name: string;
  symbol: string;
}

/**
 * CMC-style header search: a lone icon button top-right that expands into a
 * full-width search field. Fuzzy-matches name / symbol / slug with Fuse;
 * picking a result jumps to the project page.
 */
export default function ProjectSearch({ projects }: { projects: SearchProject[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ["name", "symbol", "slug"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [projects]
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return projects.slice(0, 12);
    return fuse.search(q).slice(0, 8).map((r) => r.item);
  }, [query, fuse, projects]);

  function expand() {
    setExpanded(true);
    setOpen(true);
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function collapse() {
    setExpanded(false);
    setOpen(false);
    setQuery("");
    setActive(0);
  }

  function go(p: SearchProject) {
    collapse();
    router.push(`/projects/${p.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (results[active]) go(results[active]);
    } else if (e.key === "Escape") {
      collapse();
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        className="psearch-iconbtn"
        aria-label="Search projects"
        onClick={expand}
      >
        <Icon name="search" size={20} />
      </button>
    );
  }

  return (
    <div className="psearch psearch-expanded">
      <div className="psearch-box">
        <Icon name="search" size={17} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => {
            setOpen(true);
            setActive(0);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search projects"
          aria-label="Search projects"
          role="combobox"
          aria-expanded={open}
          aria-controls="psearch-list"
          autoComplete="off"
          enterKeyHint="go"
        />
        <button
          type="button"
          className="psearch-clear"
          aria-label={query ? "Clear search" : "Close search"}
          onClick={() => {
            if (query) {
              setQuery("");
              setActive(0);
              inputRef.current?.focus();
            } else {
              collapse();
            }
          }}
        >
          <Icon name="x" size={15} />
        </button>
      </div>
      {open ? (
        <>
          <button
            type="button"
            className="psearch-scrim"
            aria-hidden="true"
            tabIndex={-1}
            onClick={collapse}
          />
          <div className="psearch-drop" role="listbox" id="psearch-list">
            {results.length === 0 ? (
              <div className="psearch-empty">No projects match.</div>
            ) : (
              results.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  className={i === active ? "psearch-row active" : "psearch-row"}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(p)}
                >
                  <img
                    src={`/icons/${p.slug}.svg`}
                    alt=""
                    width={26}
                    height={26}
                    className="coin-icon"
                  />
                  <span className="psearch-name">{p.name}</span>
                  <span className="psearch-sym num">{p.symbol}</span>
                </button>
              ))
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
