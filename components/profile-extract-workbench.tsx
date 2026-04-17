"use client";

import { useState } from "react";
import { ProfileExtractConversation } from "@/components/profile-extract-conversation";
import { ProfileExtractForm } from "@/components/profile-extract-form";

export function ProfileExtractWorkbench() {
  const [mode, setMode] = useState<"conversation" | "quick">("conversation");

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          className={`pill transition ${mode === "conversation" ? "pill-active" : "hover:border-sky-400 hover:text-slate-800"}`}
          onClick={() => setMode("conversation")}
          type="button"
        >
          对话式提炼
        </button>
        <button
          className={`pill transition ${mode === "quick" ? "pill-active" : "hover:border-sky-400 hover:text-slate-800"}`}
          onClick={() => setMode("quick")}
          type="button"
        >
          快捷提炼
        </button>
      </div>

      {mode === "conversation" ? <ProfileExtractConversation /> : <ProfileExtractForm />}
    </section>
  );
}
