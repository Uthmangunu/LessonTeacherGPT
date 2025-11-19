import { Concept } from "@/types";

export type AdvisoryPrompt = {
  id: string;
  agent: string;
  message: string;
  impact: string;
};

type AdvisoryInput = {
  isProcessing: boolean;
  conceptCount: number;
  conceptsNeedingMatches: number;
  lastUploadMinutes: number | null;
};

export function buildAdvisories({ isProcessing, conceptCount, conceptsNeedingMatches, lastUploadMinutes }: AdvisoryInput) {
  const advisories: AdvisoryPrompt[] = [];

  if (isProcessing) {
    advisories.push({
      id: "doc-agent",
      agent: "DocumentIngestor",
      message: "Document parsing still running. Spin up another ingestion worker to parallelize large uploads.",
      impact: "Cuts wait time ~35% on >20 page PDFs.",
    });
  }

  if (conceptCount >= 4 && conceptsNeedingMatches > 0) {
    advisories.push({
      id: "video-agent",
      agent: "YouTubeScout",
      message: "Multiple concepts lack video matches. Recruit the YouTube scout to fan out search + transcript jobs.",
      impact: "Surfaces 3x more candidates per concept.",
    });
  }

  if (conceptsNeedingMatches >= 2) {
    advisories.push({
      id: "timestamp-agent",
      agent: "TimestampAligner",
      message: "Queued concepts have zero timestamp coverage. Launch alignment agent to chunk transcripts faster.",
      impact: "Improves timestamp accuracy to ±5s.",
    });
  }

  if (lastUploadMinutes !== null && lastUploadMinutes > 30) {
    advisories.push({
      id: "refresh-agent",
      agent: "Refresher",
      message: "It has been over 30 minutes since last upload. Run a quick refresh to keep embeddings warm.",
      impact: "Avoids cold starts on the embedding store.",
    });
  }

  return advisories;
}

export function countConceptsNeedingMatches(concepts: Concept[]) {
  return concepts.filter((concept) => concept.matches.length === 0).length;
