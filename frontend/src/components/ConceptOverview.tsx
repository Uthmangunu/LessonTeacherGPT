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
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
        Syncing concepts from backend...
      </div>
    );
  }

  if (!concepts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500 shadow-sm">
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
            className={`w-full rounded-2xl border px-4 py-4 text-left shadow-sm transition ${
              isSelected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">{concept.title}</span>
              <span className="text-xs font-medium text-indigo-600">
                Priority #{concept.priority + 1}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{concept.summary || "Summary pending..."}</p>
            <p className="mt-1 text-xs text-slate-500">
              {concept.matches.length ? `${concept.matches.length} video matches` : "Waiting for video matches"}
            </p>
          </button>
        );
      })}
    </div>
  );
};
