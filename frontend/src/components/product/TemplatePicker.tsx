"use client";

import { TEMPLATES, type Template } from "@/content/templates";

/** Dropdown of ready-made scripts. */
export function TemplatePicker({ onPick }: { onPick: (t: Template) => void }) {
  const groups = ["English", "Urdu", "Hindi"] as const;
  return (
    <label className="template-pick">
      <span className="muted">Start from a template</span>
      <select
        defaultValue=""
        onChange={(e) => {
          const t = TEMPLATES.find((x) => x.id === e.target.value);
          if (t) onPick(t);
          e.target.value = "";
        }}
      >
        <option value="" disabled>Choose a script…</option>
        {groups.map((g) => (
          <optgroup key={g} label={g}>
            {TEMPLATES.filter((t) => t.language === g).map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
