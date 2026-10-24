"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const message = String(form.get("message") ?? "");
    const subject = encodeURIComponent(`SiteSpecCalc note from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:hello@sitespeccalc.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm">
        Name
        <input name="name" required className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2" />
      </label>
      <label className="block text-sm">
        Email
        <input name="email" type="email" required className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2" />
      </label>
      <label className="block text-sm">
        Message
        <textarea name="message" required rows={6} className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2" />
      </label>
      <button type="submit" className="rounded-md bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">
        Open email to hello@sitespeccalc.com
      </button>
      {sent ? (
        <p className="text-sm text-emerald-300">Your mail app should open with the note. We do not store the form on a server.</p>
      ) : null}
    </form>
  );
}
