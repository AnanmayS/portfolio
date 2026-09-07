"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Evidence } from "./content";

/*
  A claim you can open. The page states a measured number in the middle of a
  sentence; this puts the run it came from one click away without sending the
  reader off the page. The dialog is the same house pattern as the contact
  form: a native <dialog>, showModal, Escape closes, a token backdrop, and
  focus handed back to the word that was clicked.
*/

export function Claim({
  evidence,
  children,
}: {
  evidence: Evidence;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  /*
    A claim sits inside the lede's <p>, and a <dialog> is flow content: leaving
    it there makes the browser hoist it out of the paragraph and hydration
    fails. So the drawer is portalled to <body>, and only after mount, so the
    first client render still matches the prerendered HTML exactly.
  */
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const current = dialog.current;
    if (!current) return;

    /* Escape and the close button both fire `close`; either way the reader
       is put back on the word they left. */
    const handleClose = () => trigger.current?.focus();

    current.addEventListener("close", handleClose);
    return () => current.removeEventListener("close", handleClose);
  }, [mounted]);

  const openDialog = () => dialog.current?.showModal();
  const closeDialog = () => dialog.current?.close();

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) {
      closeDialog();
    }
  };

  const drawer = (
    <dialog
      aria-labelledby={titleId}
      className="ev-dialog"
      onClick={handleBackdropClick}
      ref={dialog}
    >
      <div className="ev-dialog-panel">
        <header className="ev-dialog-header">
          <h2 id={titleId}>{children}</h2>
          <button
            aria-label="Close evidence"
            className="ev-dialog-close"
            onClick={closeDialog}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="ev-body">
          <p className="ev-kicker">{evidence.label}</p>

          {evidence.kind === "excerpt" && evidence.lines ? (
            <pre className="ev-lines">{evidence.lines.join("\n")}</pre>
          ) : null}

          {evidence.kind === "table" && evidence.rows ? (
            <dl className="ev-rows">
              {evidence.rows.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {evidence.kind === "link" ? (
            <p className="ev-single">{evidence.href ?? evidence.source}</p>
          ) : null}

          <footer className="ev-foot">
            <p className="ev-source">source: {evidence.source}</p>
            {evidence.href ? (
              <a
                className="ev-open"
                href={evidence.href}
                rel="noreferrer"
                target="_blank"
              >
                open on github ↗
              </a>
            ) : null}
          </footer>
        </div>
      </div>
    </dialog>
  );

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="ev-claim"
        onClick={openDialog}
        ref={trigger}
        type="button"
      >
        <span className="ev-claim-text">{children}</span>
        <sup aria-hidden="true" className="ev-claim-label">
          {evidence.label}
        </sup>
        <span className="ev-claim-sr"> — evidence: {evidence.label}</span>
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}

/*
  Wraps every evidence key that appears verbatim in the lede. One left-to-right
  pass, longest keys tried first at each position, so a key that contains
  another key still wins and the output never depends on object key order.
  A key that does not appear is simply not rendered.
*/
export function buildLede(
  text: string,
  evidence: Record<string, Evidence>,
): React.ReactNode[] {
  const keys = Object.keys(evidence)
    .filter((key) => key.length > 0)
    .sort((a, b) => b.length - a.length || (a < b ? -1 : 1));

  if (keys.length === 0) return [text];

  const out: React.ReactNode[] = [];
  let plain = "";
  let at = 0;

  const flush = () => {
    if (plain) {
      out.push(plain);
      plain = "";
    }
  };

  while (at < text.length) {
    const hit = keys.find((key) => text.startsWith(key, at));

    if (hit) {
      flush();
      out.push(
        <Claim evidence={evidence[hit]} key={`${hit}-${at}`}>
          {hit}
        </Claim>,
      );
      at += hit.length;
    } else {
      plain += text[at];
      at += 1;
    }
  }

  flush();
  return out;
}

export function Lede({
  text,
  evidence,
}: {
  text: string;
  evidence: Record<string, Evidence>;
}) {
  return <>{buildLede(text, evidence)}</>;
}
