import { VideoMatch } from "@/types";

type PreviewPlayerProps = {
  match?: VideoMatch | null;
};

export const PreviewPlayer = ({ match }: PreviewPlayerProps) => {
  if (!match) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
        Select a video match to preview the recommended timestamp.
      </div>
    );
  }

  const start = Math.floor(match.startSeconds);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-black">
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
      <div className="space-y-2 px-5 py-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{match.videoTitle}</p>
        <p className="text-xs text-slate-500">
          {Math.floor(match.startSeconds)}s → {Math.ceil(match.endSeconds)}s • {match.channelTitle}
        </p>
        <p className="text-sm text-slate-600">{match.segmentText}</p>
      </div>
    </div>
  );
};
