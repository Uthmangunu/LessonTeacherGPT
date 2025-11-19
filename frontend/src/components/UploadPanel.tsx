'use client';

import { useState } from "react";
import { UploadMaterialPayload } from "@/types";

type UploadPanelProps = {
  onUpload: (payload: UploadMaterialPayload) => Promise<void>;
  isUploading: boolean;
};

export const UploadPanel = ({ onUpload, isUploading }: UploadPanelProps) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    await onUpload({ title, textContent, file, sourceType: file ? "upload" : "link" });
    setTitle("");
    setTextContent("");
    setFile(null);
    event.currentTarget.reset();
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/70 shadow-sm backdrop-blur">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Upload Material</h2>
        <p className="text-sm text-slate-500">
          Send PDFs or paste notes—we will orchestrate concept extraction & agent prompts.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <div>
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-indigo-500 focus:outline-none"
            placeholder="Linear Algebra Midterm Notes"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Notes / Outline</label>
          <textarea
            className="mt-1 h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-inner focus:border-indigo-500 focus:outline-none"
            placeholder="Paste raw notes or lecture outline..."
            value={textContent}
            onChange={(event) => setTextContent(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <label className="font-medium text-slate-700">Optional PDF Upload</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-slate-600"
          />
          <p className="text-xs text-slate-500">Supports PDFs, docs, or text dumps.</p>
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isUploading ? "Uploading & Queuing Agents..." : "Upload & Start Matching"}
        </button>
      </form>
    </section>
  );
};
