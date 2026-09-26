"use client";

import { useEffect, useRef, useState } from "react";
import { person } from "./content";
import { SendIcon } from "./icons";

/*
  The email card. It opens like a compose window with the recipient already
  filled in, so a reader writes a subject and a message and hits Send; they
  never have to type an address, theirs or mine. Delivery goes through
  formsubmit.co to the address in content.ts. A reply-to field is offered
  but optional.

  One dialog is mounted on the page (<Compose />). Any number of triggers
  (<ComposeTrigger />) open it by dispatching an event on the window, so any
  button that says email reaches the same card.
*/

const OPEN_EVENT = "compose:open";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${person.email}`;

type Status = "idle" | "sending" | "success" | "error";

export function ComposeTrigger({
  children,
  className,
  title,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      className={className}
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

export function Compose() {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const subject = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;

    const open = () => {
      if (!el.open) el.showModal();
      /* showModal() focuses the first control (the close button); move on. */
      requestAnimationFrame(() => subject.current?.focus());
    };
    const reset = () => {
      setStatus("idle");
      form.current?.reset();
    };

    window.addEventListener(OPEN_EVENT, open);
    el.addEventListener("close", reset);
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      el.removeEventListener("close", reset);
    };
  }, []);

  const close = () => dialog.current?.close();

  const onBackdrop = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) close();
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    const data = new FormData(event.currentTarget);
    const replyTo = String(data.get("replyto") ?? "").trim();

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          _subject: data.get("subject"),
          _template: "table",
          _captcha: "false",
          _honey: data.get("website"),
          ...(replyTo ? { _replyto: replyTo } : {}),
          message: data.get("message"),
          page: window.location.href,
        }),
      });

      if (!response.ok) throw new Error("Message could not be sent");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const busy = status === "sending";

  return (
    <dialog
      aria-labelledby="compose-title"
      className="compose"
      onClick={onBackdrop}
      ref={dialog}
    >
      <div className="compose-panel">
        <header className="compose-head">
          <h2 id="compose-title">New email</h2>
          <button aria-label="Close" className="compose-close" onClick={close} type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {status === "success" ? (
          <div className="compose-sent" role="status">
            <strong>Sent.</strong>
            <p>Thanks for reaching out. I&rsquo;ll get back to you soon.</p>
            <button className="compose-send" onClick={close} type="button">
              Done
            </button>
          </div>
        ) : (
          <form className="compose-form" onSubmit={onSubmit} ref={form}>
            <div className="compose-line">
              <span className="compose-key">To</span>
              <span className="compose-chip">
                <span className="compose-avatar" aria-hidden="true">
                  {person.first[0]}
                </span>
                {person.email}
              </span>
            </div>

            <label className="compose-line">
              <span className="compose-key">From</span>
              <input
                autoComplete="email"
                className="compose-from"
                inputMode="email"
                name="replyto"
                placeholder="your email, if you'd like a reply"
                type="email"
              />
            </label>

            <input
              aria-label="Subject"
              autoFocus
              className="compose-subject"
              name="subject"
              placeholder="Subject"
              ref={subject}
              required
            />

            <textarea
              aria-label="Message"
              className="compose-body"
              name="message"
              placeholder={`Hey ${person.first},`}
              required
              rows={8}
            />

            <label className="compose-honeypot" aria-hidden="true">
              Website
              <input autoComplete="off" name="website" tabIndex={-1} />
            </label>

            <footer className="compose-foot">
              {status === "error" ? (
                <p className="compose-error" role="alert">
                  Didn&rsquo;t go through. Try again, or email me directly at {person.email}.
                </p>
              ) : (
                <span />
              )}
              <button className="compose-send" disabled={busy} type="submit">
                {busy ? "Sending…" : "Send"}
                <SendIcon size={15} />
              </button>
            </footer>
          </form>
        )}
      </div>
    </dialog>
  );
}
