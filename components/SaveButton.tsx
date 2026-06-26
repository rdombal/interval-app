"use client";

import { useState, useTransition } from "react";
import { toggleSave } from "@/app/actions";

export function SaveButton({
  workoutId,
  initialSaved,
  variant = "full",
}: {
  workoutId: string;
  initialSaved: boolean;
  variant?: "full" | "icon";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  function onClick() {
    setSaved((s) => !s); // optimistic
    start(async () => {
      const res = await toggleSave(workoutId);
      setSaved(res.saved);
    });
  }

  const heart = (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={saved ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 21s-7.5-4.7-10-9.2C.2 8.4 1.8 4.8 5.3 4.8c2 0 3.4 1.2 4.7 3 1.3-1.8 2.7-3 4.7-3 3.5 0 5.1 3.6 3.3 7C19.5 16.3 12 21 12 21z" />
    </svg>
  );

  if (variant === "icon") {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save workout"}
        className={`rounded-full p-2 transition ${
          saved ? "text-heat-500" : "text-neutral-400 hover:text-heat-500"
        }`}
      >
        {heart}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
        saved
          ? "border-heat-200 bg-heat-50 text-heat-600"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-heat-200 hover:text-heat-600"
      }`}
    >
      {heart}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
