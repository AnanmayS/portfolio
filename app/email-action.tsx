"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL_ADDRESS = "ananmays20@gmail.com";

function copyWithFallback(value: string) {
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();

  const copied = document.execCommand("copy");
  input.remove();

  if (!copied) {
    throw new Error("Copy command was unavailable");
  }
}

export function EmailAction({
  label,
  showArrow = false,
}: {
  label: string;
  showArrow?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const handleClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(EMAIL_ADDRESS);
      } else {
        copyWithFallback(EMAIL_ADDRESS);
      }

      setCopied(true);

      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }

      resetTimer.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Copy this email address:", EMAIL_ADDRESS);
    }
  };

  return (
    <a
      aria-label={`Copy email address ${EMAIL_ADDRESS}`}
      href={`mailto:${EMAIL_ADDRESS}`}
      onClick={handleClick}
      title={`Copy ${EMAIL_ADDRESS}`}
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
      {showArrow ? <span aria-hidden="true"> ↗</span> : null}
    </a>
  );
}
