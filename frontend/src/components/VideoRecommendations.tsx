import { VideoMatch } from "@/types";

type VideoRecommendationsProps = {
  matches: VideoMatch[];
  onSelect: (match: VideoMatch) => void;
  selectedMatchId?: number | null;
};

export const VideoRecommendations = ({
  matches,
  onSelect,
  selectedMatchId,
}: VideoRecommendationsProps) => {
  if (!matches.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
        No matches yet. Kick off the YouTube sub-agents once transcripts are ready.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {matches.map((match) => {
        const isActive = match.id === selectedMatchId;
        return (
          <button
            key={match.id}
            onClick={() => onSelect(match)}
            className={`flex flex-col rounded-2xl border px-3 pb-3 text-left shadow-sm transition ${
              isActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200"
            }`}
          >
            <img
              src={match.thumbnailUrl}
              alt={match.videoTitle}
              className="h-36 w-full rounded-xl object-cover"
            />
            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-900">{match.videoTitle}</p>
              <p className="text-xs text-slate-500">{match.channelTitle}</p>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {Math.floor(match.startSeconds)}s - {Math.ceil(match.endSeconds)}s
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                {(match.similarity * 100).toFixed(0)}%
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
