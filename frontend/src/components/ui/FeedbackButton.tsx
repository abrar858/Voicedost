"use client";

import { useState } from "react";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Floating "Feedback" button. Messages are saved to the Supabase feedback table. */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  if (!URL_ || !KEY) return null;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${URL_}/rest/v1/feedback`, {
        method: "POST",
        headers: { apikey: KEY!, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          message: message.trim().slice(0, 2000),
          contact: contact.trim().slice(0, 200) || null,
          page: window.location.pathname.slice(0, 200),
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setMessage("");
      setContact("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="feedback">
      {open && (
        <form className="feedback-panel panel stack" onSubmit={send} aria-label="Send feedback">
          {status === "sent" ? (
            <>
              <strong>Thank you! 🙏</strong>
              <p style={{ margin: 0 }}>Your feedback helps us make VoiceDost better.</p>
              <button type="button" className="btn btn-outline" onClick={() => { setOpen(false); setStatus("idle"); }}>Close</button>
            </>
          ) : (
            <>
              <strong>Tell us what you think</strong>
              <label htmlFor="fb-message" className="muted">Which voices do you like? What should we add or fix?</label>
              <textarea id="fb-message" required minLength={2} maxLength={2000} rows={4}
                value={message} onChange={(e) => setMessage(e.target.value)} />
              <label htmlFor="fb-contact" className="muted">Email or WhatsApp (optional, if you&apos;d like a reply)</label>
              <input id="fb-contact" maxLength={200} value={contact} onChange={(e) => setContact(e.target.value)} />
              <button type="submit" className="btn btn-orange" disabled={status === "sending" || message.trim().length < 2}>
                {status === "sending" ? "Sending…" : "Send feedback"}
              </button>
              {status === "error" && <span className="error-light">Could not send. Please try again.</span>}
            </>
          )}
        </form>
      )}
      <button type="button" className="btn btn-dark feedback-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "💬 Feedback"}
      </button>
    </div>
  );
}
