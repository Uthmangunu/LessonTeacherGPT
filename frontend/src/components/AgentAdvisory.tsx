import { AdvisoryPrompt } from "@/lib/advisory";

type AgentAdvisoryProps = {
  advisories: AdvisoryPrompt[];
};

export const AgentAdvisory = ({ advisories }: AgentAdvisoryProps) => {
  if (!advisories.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-500 shadow-sm">
        All agents idle. Upload new material or wait for status updates.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {advisories.map((advisory) => (
        <div key={advisory.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-900">{advisory.agent}</span>
            <span className="text-xs font-semibold uppercase text-amber-600">Recruit</span>
          </div>
          <p className="mt-2 text-sm text-amber-900">{advisory.message}</p>
          <p className="mt-1 text-xs text-amber-600">{advisory.impact}</p>
        </div>
      ))}
    </div>
  );
};
