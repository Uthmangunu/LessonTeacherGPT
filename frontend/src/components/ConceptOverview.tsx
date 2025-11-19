import { Concept } from "@/types";

type ConceptOverviewProps = {
  concepts: Concept[];
  selectedConceptId: number | null;
  onSelect: (conceptId: number) => void;
  isLoading?: boolean;
};

export const ConceptOverview = ({
  concepts,
  selectedConceptId,
  onSelect,
  isLoading,
}: ConceptOverviewProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-400 shadow-inner">
        Syncing concepts from backend...
      </div>
    );
  }

  if (!concepts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-slate-500 shadow-inner">
        Upload material to extract concepts automatically.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {concepts.map((concept) => {
        const isSelected = concept.id === selectedConceptId;
        return (
          <button
            key={concept.id}
            onClick={() => onSelect(concept.id)}
            className={`w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition-all duration-200 ${isSelected
                ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
              }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-200"}`}>
                {concept.title}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? "text-indigo-400" : "text-slate-500"}`}>
                Priority #{concept.priority + 1}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-400">{concept.summary || "Summary pending..."}</p>
            <p className={`mt-2 text-xs font-medium ${concept.matches.length ? "text-emerald-400" : "text-amber-500"}`}>
              {concept.matches.length ? `${concept.matches.length} video matches` : "Waiting for video matches"}
            </p>
          </button>
        );
      })}
    </div>
  );
};
