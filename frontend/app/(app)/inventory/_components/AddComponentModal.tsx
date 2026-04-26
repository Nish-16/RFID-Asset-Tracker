"use client";

import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Overlay, CloseButton, Field, inputCls, adjBtn, cancelBtn, submitBtn } from "./ui";

export function AddComponentModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [totalCount, setTotalCount] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function deriveCode(n: string) {
    return n.trim().toUpperCase().replace(/\s+/g, "").slice(0, 8);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimName = name.trim();
    const trimCode = code.trim().toUpperCase();
    if (!trimName || !trimCode) {
      setError("Both name and code are required.");
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, "components", trimCode), {
        code: trimCode,
        name: trimName,
        totalCount,
      });
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Add Component Type</h3>
        <CloseButton onClick={onClose} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Component Name">
          <input
            type="text"
            placeholder="e.g. ESP32, Raspberry Pi 4"
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              if (!code) setCode(deriveCode(e.target.value));
            }}
            className={inputCls}
          />
        </Field>

        <Field label="Code" hint="Unique ID — used as the Firestore doc ID">
          <input
            type="text"
            placeholder="e.g. ESP32, RPI4"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`${inputCls} font-mono`}
          />
        </Field>

        <Field label="Total Units">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTotalCount(Math.max(1, totalCount - 1))}
              className={adjBtn}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
            <input
              type="number"
              min={1}
              value={totalCount}
              onChange={(e) => setTotalCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              type="button"
              onClick={() => setTotalCount(totalCount + 1)}
              className={adjBtn}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </Field>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={cancelBtn}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={submitBtn}>
            {saving ? "Saving…" : "Add Component"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}
