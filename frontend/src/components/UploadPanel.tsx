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
    <section className="rounded-2xl border border-white/10 bg-white/5 shadow-inner backdrop-blur-md">
      <div className="border-b border-white/5 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Upload Material</h2>
        <p className="text-sm text-slate-400">
          Send PDFs or paste notes—we will orchestrate concept extraction & agent prompts.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <div>
          <label className="text-sm font-medium text-slate-300">Title</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-slate-500 shadow-inner focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
            placeholder="Linear Algebra Midterm Notes"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300">Notes / Outline</label>
          <textarea
            className="mt-1 h-28 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder-slate-500 shadow-inner focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
            placeholder="Paste raw notes or lecture outline..."
            value={textContent}
            onChange={(event) => setTextContent(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <label className="font-medium text-slate-300">Optional PDF Upload</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-slate-400 file:mr-4 file:rounded-full file:border-0 file:bg-fuchsia-500/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-fuchsia-400 hover:file:bg-fuchsia-500/20"
          />
          <p className="text-xs text-slate-500">Supports PDFs, docs, or text dumps.</p>
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="w-full rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-3 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] hover:shadow-fuchsia-500/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isUploading ? "Uploading & Queuing Agents..." : "Upload & Start Matching"}
        </button>
      </form>
    </section>
  );
};
