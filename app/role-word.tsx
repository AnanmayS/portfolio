"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronIcon } from "./icons";

/*
  The one handwritten phrase in the intro. Click it and it behaves like a
  selected text box: corner handles and a small toolbar that really changes
  the face, weight, and slant of the word. A small thing that makes the page
  feel hand-built rather than templated; nothing else on the page depends on
  it, and with JavaScript off it is just the phrase in Caveat.
*/

const faces = [
  { id: "hand", label: "Caveat" },
  { id: "sans", label: "Public Sans" },
  { id: "mono", label: "Geist Mono" },
] as const;

type Face = (typeof faces)[number]["id"];

export function RoleWord({ children }: { children: string }) {
  const [open, setOpen] = useState(false);
  const [face, setFace] = useState<Face>("hand");
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const away = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const nextFace = () => {
    const at = faces.findIndex((f) => f.id === face);
    setFace(faces[(at + 1) % faces.length].id);
  };

  const current = faces.find((f) => f.id === face) ?? faces[0];

  return (
    <span className={`role${open ? " is-open" : ""}`} ref={root}>
      <button
        className={`role-word role-${face}${bold ? " is-bold" : ""}${italic ? " is-italic" : ""}`}
        type="button"
        aria-expanded={open}
        aria-controls="role-tools"
        onClick={() => setOpen((v) => !v)}
      >
        {children}
        <span className="role-handle" aria-hidden="true" />
        <span className="role-handle" aria-hidden="true" />
        <span className="role-handle" aria-hidden="true" />
        <span className="role-handle" aria-hidden="true" />
      </button>

      <span className="role-tools" id="role-tools" role="toolbar" aria-label="Style the phrase" hidden={!open}>
        <button className={`role-tool role-tool-face role-${face}`} type="button" onClick={nextFace}>
          {current.label}
          <ChevronIcon size={9} />
        </button>
        <span className="role-tools-rule" aria-hidden="true" />
        <button
          className="role-tool role-tool-b"
          type="button"
          aria-pressed={bold}
          aria-label="Bold"
          onClick={() => setBold((v) => !v)}
        >
          B
        </button>
        <button
          className="role-tool role-tool-i"
          type="button"
          aria-pressed={italic}
          aria-label="Italic"
          onClick={() => setItalic((v) => !v)}
        >
          I
        </button>
      </span>
    </span>
  );
}
