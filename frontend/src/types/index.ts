export interface VideoMatch {
  id: number;
  videoId: string;
  videoTitle: string;
  channelTitle: string;
  thumbnailUrl: string;
  startSeconds: number;
  endSeconds: number;
  similarity: number;
  segmentText: string;
}

export interface Concept {
  id: number;
  title: string;
  summary: string;
  priority: number;
  matches: VideoMatch[];
}

export interface LearningMaterial {
  id: number;
  title: string;
  status: string;
  sourceType: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
  concepts: Concept[];
}

export interface UploadMaterialPayload {
  title: string;
  textContent: string;
  sourceType?: string;
  file?: File | null;
}
