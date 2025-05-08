import { ChevronDown, ChevronUp } from "lucide-react";

export default function StationSidebar({
  groupedParameters,
  selectedParams,
  toggleParam,
  sidebarHeight,
  openGroups,
  setOpenGroups,
}: {
  groupedParameters: Record<string, any[]>;
  selectedParams: string[];
  toggleParam: (name: string) => void;
  sidebarHeight: number;
  openGroups: Record<string, boolean>;
  setOpenGroups: (cb: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
}) {
  const groupedWithFallback: Record<string, any[]> = {};
  const ungroupedParams: any[] = [];

  Object.entries(groupedParameters).forEach(([group, params]) => {
    if (!params || params.length === 0) {
      ungroupedParams.push({ group, params });
    } else {
      groupedWithFallback[group] = params;
    }
  });

  if (ungroupedParams.length > 0) {
    groupedWithFallback["Chưa phân loại"] = ungroupedParams.flatMap((g) => g.params || []);
  }

  const allGroups = Object.entries(groupedWithFallback);
  allGroups.sort(([a], [b]) => {
    if (a === "Chưa phân loại" || a === "Khác") return 1;
    if (b === "Chưa phân loại" || b === "Khác") return -1;
    return a.localeCompare(b);
  });

  const groupCount = allGroups.length;

  return (
    <div className="w-52 h-full overflow-y-auto border-r px-2 py-1">
      {allGroups.map(([group, params]) => {
        const groupHeaderHeight = 40;
        const openGroupMaxHeight = sidebarHeight - groupCount * groupHeaderHeight - 40;

        const isOpen = openGroups[group] ?? false;

        return (
          <div key={group} className="border-b py-1">
            <button
              className="w-full flex items-center justify-between font-semibold text-left h-10"
              onClick={() =>
                setOpenGroups((prev) => ({
                  ...Object.fromEntries(
                    allGroups.map(([g]) => [g, false])
                  ),
                  [group]: !isOpen,
                }))
              }
            >
              {group}
              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isOpen && (
              <div
                className="mt-2 space-y-1 overflow-y-auto pr-1"
                style={{ maxHeight: `${openGroupMaxHeight}px` }}
              >
                {params.map((param) => (
                  <div
                    key={param.id}
                    className="flex items-center gap-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedParams.includes(param.name)}
                      onChange={() => toggleParam(param.name)}
                    />
                    <label>{param.name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}