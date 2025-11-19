import { Concept, LearningMaterial, UploadMaterialPayload, VideoMatch } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000/api";
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;

const sampleMatches: VideoMatch[] = [
  {
    id: 1,
    videoId: "demo-101",
    videoTitle: "Understanding Gradient Descent",
    channelTitle: "LessonTeacherGPT",
    thumbnailUrl: "https://placehold.co/320x180",
    startSeconds: 45,
    endSeconds: 120,
    similarity: 0.81,
    segmentText: "We analyze convergence criteria and build intuition with visuals.",
  },
  {
    id: 2,
    videoId: "demo-102",
    videoTitle: "Optimization Warmup",
    channelTitle: "LessonTeacherGPT",
    thumbnailUrl: "https://placehold.co/320x180",
    startSeconds: 130,
    endSeconds: 190,
    similarity: 0.78,
    segmentText: "Review of partial derivatives before applying them in GD.",
  },
];

const sampleConcepts: Concept[] = [
  {
    id: 9001,
    title: "Gradient Descent Fundamentals",
    summary: "Covers loss landscapes and update rules for convex functions.",
    priority: 0,
    matches: sampleMatches,
  },
  {
    id: 9002,
    title: "Learning Rate Schedules",
    summary: "Practical heuristics for picking lr and adapting it over time.",
    priority: 1,
    matches: [],
  },
];

const sampleMaterials: LearningMaterial[] = [
  {
    id: 501,
    title: "Sample Deep Learning Notes",
    status: "ready",
    sourceType: "upload",
    createdAt: new Date().toISOString(),
    concepts: sampleConcepts,
    metadata: {},
  },
];

function authHeaders() {
  return API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.headers || {}),
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed");
  }

  return (await response.json()) as T;
}

function normalizeMaterial(payload: any): LearningMaterial {
  return {
    id: payload.id,
    title: payload.title,
    status: payload.status,
    sourceType: payload.source_type,
    createdAt: payload.created_at,
    metadata: payload.metadata,
    concepts: (payload.concepts ?? []).map(normalizeConcept),
  };
}

function normalizeConcept(payload: any): Concept {
  return {
    id: payload.id,
    title: payload.title,
    summary: payload.summary,
    priority: payload.priority,
    matches: (payload.matches ?? []).map((match: any) => ({
      id: match.id,
      videoId: match.video.video_id,
      videoTitle: match.video.title,
      channelTitle: match.video.channel_title,
      thumbnailUrl: match.video.thumbnail_url,
      startSeconds: match.segment.start_seconds,
      endSeconds: match.segment.end_seconds,
      similarity: match.similarity,
      segmentText: match.segment.text,
    })),
  };
}

export async function uploadLearningMaterial(payload: UploadMaterialPayload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("source_type", payload.sourceType ?? "upload");
  if (payload.textContent) {
    formData.append("text_content", payload.textContent);
  }
  if (payload.file) {
    formData.append("original_file", payload.file);
  }

  const response = await fetch(`${API_BASE_URL}/upload-material/`, {
    method: "POST",
    body: formData,
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Upload failed");
  }

  return response.json();
}

export async function getLearningMaterials(): Promise<LearningMaterial[]> {
  try {
    const data = await request<any[]>("/materials/");
    return data.map(normalizeMaterial);
  } catch (error) {
    console.warn("Falling back to sample materials", error);
    return sampleMaterials;
  }
}

export async function getConcepts(materialId: number): Promise<Concept[]> {
  try {
    const data = await request<any[]>(`/materials/${materialId}/concepts/`);
    return data.map(normalizeConcept);
  } catch (error) {
    console.warn("Falling back to sample concepts", error);
    return sampleConcepts;
  }
}
