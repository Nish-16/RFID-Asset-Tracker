"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ComponentRow } from "./types";
import { Overlay, CloseButton, Field, inputCls, cancelBtn, submitBtn } from "./ui";

export function IssueModal({
  component,
  onClose,
}: {
  component: ComponentRow;
  onClose: () => void;
}) {
  const [studentName, setStudentName] = useState("");
  const [studentUid, setStudentUid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentName.trim()) {
      setError("Student name is required.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "transactions"), {
        uid: studentUid.trim() || "MANUAL",
        studentName: studentName.trim(),
        componentCode: component.code,
        componentName: component.name,
        issueTime: new Date().toISOString(),
        returnTime: null,
        status: "issued",
      });
      onClose();
    } catch {
      setError("Failed to issue. Please try again.");
      setSaving(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Issue Component</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {component.name}
            <span className="mx-1 text-slate-300">·</span>
            {component.availableCount} of {component.totalCount} available
          </p>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Student Name">
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={studentName}
            autoFocus
            onChange={(e) => setStudentName(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="RFID UID" hint="optional">
          <input
            type="text"
            placeholder="e.g. A1B2C3D4"
            value={studentUid}
            onChange={(e) => setStudentUid(e.target.value)}
            className={`${inputCls} font-mono`}
          />
        </Field>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={cancelBtn}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || component.availableCount === 0}
            className={submitBtn}
          >
            {saving ? "Issuing…" : "Issue Component"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}
