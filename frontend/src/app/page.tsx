"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AgentAdvisory } from "@/components/AgentAdvisory";
import { ConceptOverview } from "@/components/ConceptOverview";
import { PreviewPlayer } from "@/components/PreviewPlayer";
import { UploadPanel } from "@/components/UploadPanel";
import { VideoRecommendations } from "@/components/VideoRecommendations";
import { buildAdvisories, countConceptsNeedingMatches } from "@/lib/advisory";
import { getConcepts, getLearningMaterials, uploadLearningMaterial } from "@/services/api";
import { Concept, LearningMaterial, UploadMaterialPayload, VideoMatch } from "@/types";

export default function Home() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<VideoMatch | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("System Idle");
  const [lastUploadTimestamp, setLastUploadTimestamp] = useState<number | null>(null);

  const selectedMaterial = materials.find((material) => material.id === selectedMaterialId) ?? null;
  const selectedConcept = concepts.find((concept) => concept.id === selectedConceptId) ?? null;

  const refreshMaterials = useCallback(
    async (nextMaterialId?: number) => {
      try {
        const data = await getLearningMaterials();
        setMaterials(data);
        if (nextMaterialId) {
          setSelectedMaterialId(nextMaterialId);
        } else if (data.length) {
          const existing = data.find((material) => material.id === selectedMaterialId);
          setSelectedMaterialId(existing ? existing.id : data[0].id);
        } else {
          setSelectedMaterialId(null);
        }
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Failed to load materials");
      }
    },
    [selectedMaterialId],
  );

  useEffect(() => {
    refreshMaterials();
  }, [refreshMaterials]);

  useEffect(() => {
    const fetchConcepts = async () => {
      if (!selectedMaterialId) {
        setConcepts([]);
        return;
      }
      setConceptsLoading(true);
      try {
        const nextConcepts = await getConcepts(selectedMaterialId);
        setConcepts(nextConcepts);
        setSelectedConceptId((previous) => {
          if (!nextConcepts.length) {
            return null;
          }
          const stillExists = nextConcepts.find((concept) => concept.id === previous);
          return stillExists ? stillExists.id : nextConcepts[0].id;
        });
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Concept retrieval failed");
      } finally {
        setConceptsLoading(false);
      }
    };

    fetchConcepts();
  }, [selectedMaterialId]);

  useEffect(() => {
    setSelectedMatch(selectedConcept?.matches[0] ?? null);
  }, [selectedConcept]);

  const handleUpload = async (payload: UploadMaterialPayload) => {
    try {
      setIsUploading(true);
      setStatusMessage("Uploading material and queuing AI agents...");
      const created = await uploadLearningMaterial(payload);
      setStatusMessage("Material received. Agents are extracting concepts.");
      setLastUploadTimestamp(Date.now());
      await refreshMaterials(created.id ?? undefined);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const advisories = useMemo(
    () =>
      buildAdvisories({
        isProcessing: Boolean(selectedMaterial && selectedMaterial.status !== "ready"),
        conceptCount: concepts.length,
        conceptsNeedingMatches: countConceptsNeedingMatches(concepts),
        lastUploadMinutes:
          lastUploadTimestamp === null ? null : (Date.now() - lastUploadTimestamp) / 1000 / 60,
      }),
    [selectedMaterial, concepts, lastUploadTimestamp],
  );

  return (
    <div className="min-h-screen pb-20 text-slate-200 selection:bg-fuchsia-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030014]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-600 shadow-[0_0_15px_rgba(217,70,239,0.5)]">
              <span className="text-lg font-bold text-white">L</span>
            </div>
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-lg font-bold text-transparent">
              LessonTeacherGPT
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              {statusMessage}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-7xl px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Master your studies with <br />
            <span className="bg-gradient-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              AI-Orchestrated Intelligence
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Upload notes, map concepts, and let our agent swarm find the perfect video explanations for you.
          </p>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-[auto_auto]">

          {/* 1. Upload Panel (Top Left) */}
          <div className="glass rounded-3xl p-1 lg:col-span-4 lg:row-span-2">
            <div className="h-full rounded-[1.25rem] bg-gradient-to-b from-white/5 to-transparent p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <svg className="h-5 w-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Input Source
              </h2>
              <UploadPanel onUpload={handleUpload} isUploading={isUploading} />
            </div>
          </div>

          {/* 2. Agent Advisory (Top Middle/Right) */}
          <div className="glass rounded-3xl p-1 lg:col-span-5">
            <div className="h-full rounded-[1.25rem] bg-gradient-to-b from-white/5 to-transparent p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Agent Advisory
              </h2>
              <AgentAdvisory advisories={advisories} />
            </div>
          </div>

          {/* 3. Materials List (Top Right) */}
          <div className="glass rounded-3xl p-1 lg:col-span-3">
            <div className="flex h-full flex-col rounded-[1.25rem] bg-gradient-to-b from-white/5 to-transparent p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Library</h2>
                <button onClick={() => refreshMaterials()} className="text-xs text-fuchsia-400 hover:text-fuchsia-300">
                  Refresh
                </button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2" style={{ maxHeight: '300px' }}>
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterialId(material.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-all ${material.id === selectedMaterialId
                        ? "border-fuchsia-500/50 bg-fuchsia-500/10 shadow-[0_0_10px_rgba(217,70,239,0.1)]"
                        : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                      }`}
                  >
                    <p className="truncate text-sm font-medium text-slate-200">{material.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{new Date(material.createdAt).toLocaleDateString()}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${material.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                  </button>
                ))}
                {!materials.length && (
                  <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-slate-500">
                    Empty Library
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. Concept Map (Bottom Middle) */}
          <div className="glass rounded-3xl p-1 lg:col-span-8">
            <div className="h-full rounded-[1.25rem] bg-gradient-to-b from-white/5 to-transparent p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Concept Extraction
                </h2>
                <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">{concepts.length} Nodes</span>
              </div>
              <ConceptOverview
                concepts={concepts}
                selectedConceptId={selectedConceptId}
                onSelect={setSelectedConceptId}
                isLoading={conceptsLoading}
              />
            </div>
          </div>

          {/* 5. Video Player & Matches (Bottom Right) */}
          <div className="glass rounded-3xl p-1 lg:col-span-4">
            <div className="h-full rounded-[1.25rem] bg-gradient-to-b from-white/5 to-transparent p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Content Match
              </h2>
              <div className="space-y-4">
                <PreviewPlayer match={selectedMatch} />
                <VideoRecommendations
                  matches={selectedConcept?.matches ?? []}
                  onSelect={setSelectedMatch}
                  selectedMatchId={selectedMatch?.id ?? null}
                />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
