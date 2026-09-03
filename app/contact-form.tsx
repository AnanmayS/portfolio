"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL_ADDRESS = "ananmays20@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${EMAIL_ADDRESS}`;

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const dialog = useRef<HTMLDialogElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");

  useEffect(() => {
    const currentDialog = dialog.current;

    const handleClose = () => {
      setStatus("idle");
      form.current?.reset();
    };

    currentDialog?.addEventListener("close", handleClose);
    return () => currentDialog?.removeEventListener("close", handleClose);
  }, []);

  const openDialog = () => dialog.current?.showModal();
  const closeDialog = () => dialog.current?.close();

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialog.current) {
      closeDialog();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");

    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: data.get("subject"),
          _template: "table",
          _captcha: "false",
          _honey: data.get("website"),
          message: data.get("message"),
          page: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error("Message could not be sent");
      }

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="contact-form-trigger"
        onClick={openDialog}
        type="button"
      >
        send a message
      </button>

      <dialog
        aria-labelledby="contact-dialog-title"
        className="contact-dialog"
        onClick={handleBackdropClick}
        ref={dialog}
      >
        <div className="contact-dialog-panel">
          <header className="contact-dialog-header">
            <h2 id="contact-dialog-title">Send a message</h2>
            <button
              aria-label="Close contact form"
              className="contact-dialog-close"
              onClick={closeDialog}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          {status === "success" ? (
            <div className="contact-form-result" role="status">
              <strong>Message sent.</strong>
              <p>Thanks for reaching out. I’ll get back to you soon.</p>
              <button onClick={closeDialog} type="button">
                Done
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} ref={form}>
              <div className="contact-recipient">
                <span>To</span>
                <strong>{EMAIL_ADDRESS}</strong>
              </div>

              <label>
                <span>Subject</span>
                <input
                  autoFocus
                  name="subject"
                  placeholder="What’s this about?"
                  required
                />
              </label>

              <label>
                <span>Message</span>
                <textarea
                  name="message"
                  placeholder="Write your message here..."
                  required
                  rows={7}
                />
              </label>

              <label className="contact-honeypot" aria-hidden="true">
                Website
                <input autoComplete="off" name="website" tabIndex={-1} />
              </label>

              {status === "error" ? (
                <p className="contact-form-error" role="alert">
                  Something went wrong. Please try again.
                </p>
              ) : null}

              <footer className="contact-form-actions">
                <button
                  className="contact-form-cancel"
                  disabled={status === "sending"}
                  onClick={closeDialog}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="contact-form-submit"
                  disabled={status === "sending"}
                  type="submit"
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </footer>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
