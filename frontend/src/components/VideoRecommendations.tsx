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
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-500 shadow-inner">
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
            className={`flex flex-col rounded-2xl border px-3 pb-3 pt-3 text-left shadow-sm transition-all duration-200 ${isActive
                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
              }`}
          >
            <div className="relative w-full overflow-hidden rounded-xl">
              <img
                src={match.thumbnailUrl}
                alt={match.videoTitle}
                className="h-36 w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {Math.floor(match.startSeconds)}s
              </div>
            </div>
            <div className="mt-3 flex-1">
              <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-200"}`}>{match.videoTitle}</p>
              <p className="text-xs text-slate-400">{match.channelTitle}</p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {Math.floor(match.startSeconds)}s - {Math.ceil(match.endSeconds)}s
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400">
                {(match.similarity * 100).toFixed(0)}% Match
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
