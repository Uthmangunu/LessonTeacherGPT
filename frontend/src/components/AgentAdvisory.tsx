import { AdvisoryPrompt } from "@/lib/advisory";

type AgentAdvisoryProps = {
  advisories: AdvisoryPrompt[];
};

export const AgentAdvisory = ({ advisories }: AgentAdvisoryProps) => {
  if (!advisories.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400 shadow-inner">
        All agents idle. Upload new material or wait for status updates.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {advisories.map((advisory) => (
        <div key={advisory.id} className="rounded-2xl border border-amber-500/20 bg-amber-900/10 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-amber-200">{advisory.agent}</span>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">Recruit</span>
          </div>
          <p className="mt-2 text-sm text-slate-300">{advisory.message}</p>
          <p className="mt-2 text-xs font-medium text-amber-400/80">Impact: {advisory.impact}</p>
        </div>
      ))}
    </div>
  );
};
