"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL_ADDRESS = "ananmays20@gmail.com";

export function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      nameInput.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(
      `Hi Ananmay,\n\n${message}\n\nFrom: ${name}\nReply to: ${email}`,
    );

    window.location.href = `mailto:${EMAIL_ADDRESS}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="contact-form-shell">
      {isOpen ? (
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="contact-form-heading">
            <div>
              <h2>Send a note</h2>
              <p>This will open in your email app.</p>
            </div>
            <button
              aria-label="Close contact form"
              className="contact-form-close"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>

          <div className="contact-form-fields">
            <label>
              <span>Name</span>
              <input
                ref={nameInput}
                autoComplete="name"
                name="name"
                placeholder="Your name"
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                autoComplete="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
              />
            </label>
            <label className="contact-form-message">
              <span>Message</span>
              <textarea
                name="message"
                placeholder="What would you like to talk about?"
                required
                rows={5}
              />
            </label>
          </div>

          <button className="contact-form-submit" type="submit">
            Continue in email <span aria-hidden="true">↗</span>
          </button>
        </form>
      ) : (
        <footer className="footer">
          <span>College Park, MD</span>
          <button
            aria-expanded="false"
            className="contact-form-trigger"
            onClick={() => setIsOpen(true)}
            type="button"
          >
            Get in touch <span aria-hidden="true">↗</span>
          </button>
        </footer>
      )}
    </div>
  );
}
