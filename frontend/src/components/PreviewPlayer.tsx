import { VideoMatch } from "@/types";

type PreviewPlayerProps = {
  match?: VideoMatch | null;
};

export const PreviewPlayer = ({ match }: PreviewPlayerProps) => {
  if (!match) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-500 shadow-inner">
        Select a video match to preview the recommended timestamp.
      </div>
    );
  }

  const start = Math.floor(match.startSeconds);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-lg backdrop-blur-sm">
      <div className="aspect-video w-full bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${match.videoId}?start=${start}`}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={match.videoTitle}
          className="h-full w-full"
        />
      </div>
      <div className="space-y-2 px-5 py-4 text-sm">
        <div className="flex items-start justify-between gap-4">
          <p className="font-bold text-white">{match.videoTitle}</p>
          <span className="shrink-0 rounded bg-white/10 px-2 py-1 text-[10px] font-medium text-slate-400">
            {match.channelTitle}
          </span>
        </div>
        <p className="text-xs text-fuchsia-400">
          Playing segment: {Math.floor(match.startSeconds)}s → {Math.ceil(match.endSeconds)}s
        </p>
        <p className="text-sm leading-relaxed text-slate-300 border-l-2 border-fuchsia-500/50 pl-3">
          "{match.segmentText}"
        </p>
      </div>
    </div>
  );
};
