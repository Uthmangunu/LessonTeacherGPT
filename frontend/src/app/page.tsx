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
  const [statusMessage, setStatusMessage] = useState("Idle");
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
    <div className="min-h-screen bg-slate-50/80 pb-16">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              LessonTeacherGPT
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Study pipeline orchestrator
            </h1>
            <p className="text-sm text-slate-500">
              Upload notes, map concepts, match YouTube timestamps, and recruit sub-agents on cue.
            </p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-600">
            Status: {statusMessage}
          </div>
        </div>
      </header>

      <main className="mx-auto mt-6 flex max-w-6xl flex-col gap-6 px-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4">
            <UploadPanel onUpload={handleUpload} isUploading={isUploading} />
            <AgentAdvisory advisories={advisories} />
          </div>
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Materials</h2>
              <button
                onClick={() => refreshMaterials()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Refresh
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {materials.map((material) => {
                const isActive = material.id === selectedMaterialId;
                return (
                  <button
                    key={material.id}
                    onClick={() => setSelectedMaterialId(material.id)}
                    className={`rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
                      isActive ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{material.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(material.createdAt).toLocaleString()}
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        material.status === "ready"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {material.status}
                    </span>
                  </button>
                );
              })}
              {!materials.length && (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
                  No materials yet. Upload your first PDF to kick off the workflow.
                </p>
              )}
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Concept Overview</h2>
              <span className="text-xs font-medium text-slate-500">
                {concepts.length} concepts extracted
              </span>
            </div>
            <div className="mt-4">
              <ConceptOverview
                concepts={concepts}
                selectedConceptId={selectedConceptId}
                onSelect={setSelectedConceptId}
                isLoading={conceptsLoading}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Video Recommendations</h2>
                <span className="text-xs text-slate-500">
                  {selectedConcept ? selectedConcept.matches.length : 0} matches
                </span>
              </div>
              <div className="mt-4">
                <VideoRecommendations
                  matches={selectedConcept?.matches ?? []}
                  onSelect={setSelectedMatch}
                  selectedMatchId={selectedMatch?.id ?? null}
                />
              </div>
            </div>
            <PreviewPlayer match={selectedMatch} />
          </div>
        </section>
      </main>
    </div>
  );
}
