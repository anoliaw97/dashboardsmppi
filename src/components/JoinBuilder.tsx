"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Merge,
  Save,
  Trash2,
  Download,
  FolderOpen,
  Eye,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DataSourceConfig } from "@/lib/data-sources";
import { exportToExcel } from "@/lib/export-excel";
import { Lang, t } from "@/lib/translations";
import { ColumnDef } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface SavedJoin {
  id: string;
  name: string;
  data: AnyRecord[];
  columns: ColumnDef[];
  sourceIds: string[];
  createdAt: string;
}

interface JoinBuilderProps {
  dataSources: DataSourceConfig[];
  lang: Lang;
  onLoadJoin: (data: AnyRecord[], columns: ColumnDef[], name: string) => void;
}

const STORAGE_KEY = "smppi_saved_joins";

function getSavedJoins(): SavedJoin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSavedJoins(joins: SavedJoin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(joins));
}

// Find common column keys between selected sources
function findCommonColumns(sources: DataSourceConfig[]): string[] {
  if (sources.length < 2) return [];
  const allKeys = sources.map((s) => new Set(s.columns.map((c) => c.key)));
  const common = [...allKeys[0]].filter((key) =>
    allKeys.every((set) => set.has(key))
  );
  return common;
}

// Perform join operation
function performJoin(
  sources: DataSourceConfig[],
  joinCol: string,
  joinType: "inner" | "left" | "full"
): { data: AnyRecord[]; columns: ColumnDef[] } {
  if (sources.length < 2) return { data: [], columns: [] };

  // Merge all columns (prefix with source id for non-join columns that clash)
  const allColumns: ColumnDef[] = [];
  const seenKeys = new Set<string>();

  sources.forEach((src, srcIdx) => {
    src.columns.forEach((col) => {
      if (col.key === joinCol) {
        if (!seenKeys.has(col.key)) {
          allColumns.push(col);
          seenKeys.add(col.key);
        }
      } else {
        const uniqueKey = seenKeys.has(col.key)
          ? `${col.key}_${srcIdx + 1}`
          : col.key;
        allColumns.push({
          key: uniqueKey,
          label: seenKeys.has(col.key)
            ? `${col.label} (${srcIdx + 1})`
            : col.label,
        });
        seenKeys.add(col.key);
      }
    });
  });

  // Start with first source
  let result: AnyRecord[] = sources[0].data.map((row) => {
    const newRow: AnyRecord = {};
    sources[0].columns.forEach((col) => {
      newRow[col.key] = row[col.key];
    });
    return newRow;
  });

  // Join subsequent sources
  for (let i = 1; i < sources.length; i++) {
    const src = sources[i];
    const srcIndex = new Map<string, AnyRecord[]>();

    src.data.forEach((row) => {
      const key = String(row[joinCol] ?? "").toLowerCase();
      if (!srcIndex.has(key)) srcIndex.set(key, []);
      srcIndex.get(key)!.push(row);
    });

    const joined: AnyRecord[] = [];

    // Process existing result rows
    result.forEach((leftRow) => {
      const key = String(leftRow[joinCol] ?? "").toLowerCase();
      const rightRows = srcIndex.get(key);

      if (rightRows && rightRows.length > 0) {
        rightRows.forEach((rightRow) => {
          const merged = { ...leftRow };
          src.columns.forEach((col) => {
            if (col.key !== joinCol) {
              // Check if key already exists, suffix if needed
              const targetKey = allColumns.find(
                (ac) =>
                  (ac.key === col.key || ac.key === `${col.key}_${i + 1}`) &&
                  ac.key !== joinCol
              )?.key ?? col.key;
              merged[targetKey] = rightRow[col.key];
            }
          });
          joined.push(merged);
        });
      } else if (joinType === "left" || joinType === "full") {
        joined.push({ ...leftRow });
      }
    });

    // For full join, add unmatched right rows
    if (joinType === "full") {
      const leftKeys = new Set(
        result.map((r) => String(r[joinCol] ?? "").toLowerCase())
      );
      src.data.forEach((rightRow) => {
        const key = String(rightRow[joinCol] ?? "").toLowerCase();
        if (!leftKeys.has(key)) {
          const newRow: AnyRecord = { [joinCol]: rightRow[joinCol] };
          src.columns.forEach((col) => {
            if (col.key !== joinCol) {
              const targetKey =
                allColumns.find(
                  (ac) =>
                    (ac.key === col.key || ac.key === `${col.key}_${i + 1}`) &&
                    ac.key !== joinCol
                )?.key ?? col.key;
              newRow[targetKey] = rightRow[col.key];
            }
          });
          joined.push(newRow);
        }
      });
    }

    result = joined;
  }

  return { data: result, columns: allColumns };
}

export default function JoinBuilder({
  dataSources,
  lang,
  onLoadJoin,
}: JoinBuilderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [joinCol, setJoinCol] = useState("");
  const [joinType, setJoinType] = useState<"inner" | "left" | "full">("inner");
  const [previewData, setPreviewData] = useState<AnyRecord[] | null>(null);
  const [previewColumns, setPreviewColumns] = useState<ColumnDef[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [savedJoins, setSavedJoins] = useState<SavedJoin[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setSavedJoins(getSavedJoins());
  }, []);

  const selectedSources = useMemo(
    () => dataSources.filter((ds) => selectedIds.includes(ds.id)),
    [dataSources, selectedIds]
  );

  const commonColumns = useMemo(
    () => findCommonColumns(selectedSources),
    [selectedSources]
  );

  useEffect(() => {
    if (commonColumns.length > 0 && !commonColumns.includes(joinCol)) {
      setJoinCol(commonColumns[0]);
    }
  }, [commonColumns, joinCol]);

  const toggleSource = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setPreviewData(null);
    setShowPreview(false);
  };

  const handlePreview = () => {
    if (selectedSources.length < 2 || !joinCol) return;
    const result = performJoin(selectedSources, joinCol, joinType);
    setPreviewData(result.data);
    setPreviewColumns(result.columns);
    setShowPreview(true);
  };

  const handleSave = () => {
    if (!previewData || !saveName.trim()) return;
    const newJoin: SavedJoin = {
      id: Date.now().toString(36),
      name: saveName.trim(),
      data: previewData,
      columns: previewColumns,
      sourceIds: selectedIds,
      createdAt: new Date().toISOString().split("T")[0],
    };
    const updated = [...savedJoins, newJoin];
    setSavedJoins(updated);
    saveSavedJoins(updated);
    setSaveName("");
  };

  const handleDelete = (id: string) => {
    const updated = savedJoins.filter((j) => j.id !== id);
    setSavedJoins(updated);
    saveSavedJoins(updated);
  };

  const handleLoad = (join: SavedJoin) => {
    onLoadJoin(join.data, join.columns, join.name);
  };

  const handleExportPreview = () => {
    if (!previewData) return;
    exportToExcel(previewData, "joined_table", "Joined Data");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Merge size={18} className="text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-800">
            {t("joinBuilder", lang)}
          </h3>
        </div>
        {savedJoins.length > 0 && (
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <FolderOpen size={14} />
            {t("joinSaved", lang)} ({savedJoins.length})
            {showSaved ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500">{t("joinSubtitle", lang)}</p>

      {/* Saved Joins List */}
      {showSaved && (
        <div className="border border-indigo-100 rounded-xl p-3 bg-indigo-50/50 space-y-2">
          <p className="text-xs font-medium text-indigo-700">
            {t("joinSaved", lang)}
          </p>
          {savedJoins.length === 0 && (
            <p className="text-xs text-slate-500 italic">
              {t("joinNoSaved", lang)}
            </p>
          )}
          {savedJoins.map((join) => (
            <div
              key={join.id}
              className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-indigo-100"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {join.name}
                </p>
                <p className="text-xs text-slate-500">
                  {join.data.length} {t("records", lang)} | {join.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLoad(join)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 flex items-center gap-1"
                >
                  <Eye size={12} />
                  {t("joinLoad", lang)}
                </button>
                <button
                  onClick={() => {
                    exportToExcel(join.data, join.name, join.name);
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
                >
                  <Download size={12} />
                </button>
                <button
                  onClick={() => handleDelete(join.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100 flex items-center gap-1 border border-red-200"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Source selector */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">
          {t("joinSelectSources", lang)}
        </p>
        <div className="flex flex-wrap gap-2">
          {dataSources.map((ds) => (
            <button
              key={ds.id}
              onClick={() => toggleSource(ds.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                selectedIds.includes(ds.id)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {ds.label}
            </button>
          ))}
        </div>
      </div>

      {/* Join config */}
      {selectedIds.length >= 2 && (
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              {t("joinColumn", lang)}
            </p>
            {commonColumns.length > 0 ? (
              <select
                value={joinCol}
                onChange={(e) => {
                  setJoinCol(e.target.value);
                  setPreviewData(null);
                }}
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {commonColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-red-500 italic py-2">
                {t("joinNoCommon", lang)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">
              {t("joinType", lang)}
            </p>
            <select
              value={joinType}
              onChange={(e) => {
                setJoinType(e.target.value as "inner" | "left" | "full");
                setPreviewData(null);
              }}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="inner">{t("joinInner", lang)}</option>
              <option value="left">{t("joinLeft", lang)}</option>
              <option value="full">{t("joinFull", lang)}</option>
            </select>
          </div>
          {commonColumns.length > 0 && (
            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              <Eye size={16} />
              {t("joinPreview", lang)}
            </button>
          )}
        </div>
      )}

      {selectedIds.length < 2 && selectedIds.length > 0 && (
        <p className="text-xs text-amber-600">{t("joinSelectMin2", lang)}</p>
      )}

      {/* Preview result */}
      {showPreview && previewData && (
        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              {t("joinResult", lang)}: {previewData.length}{" "}
              {t("joinRecords", lang)}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPreview}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 flex items-center gap-1"
              >
                <Download size={12} />
                {t("exportAll", lang)}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Save control */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={
                lang === "en" ? "Enter table name..." : "Masukkan nama jadual..."
              }
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 max-w-xs"
            />
            <button
              onClick={handleSave}
              disabled={!saveName.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Save size={12} />
              {t("joinSave", lang)}
            </button>
          </div>

          {/* Load into main view */}
          <button
            onClick={() =>
              onLoadJoin(
                previewData,
                previewColumns,
                saveName || "Joined Table"
              )
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            <FolderOpen size={14} />
            {lang === "en"
              ? "Display in main table"
              : "Papar dalam jadual utama"}
          </button>

          {/* Preview table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0">
                <tr className="bg-indigo-50 border-b border-slate-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-indigo-600">
                    #
                  </th>
                  {previewColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-3 py-2 text-left text-xs font-semibold text-indigo-600 whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.slice(0, 30).map((row, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30">
                    <td className="px-3 py-1.5 text-xs text-slate-400">
                      {idx + 1}
                    </td>
                    {previewColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-1.5 text-xs text-slate-700 max-w-xs truncate"
                      >
                        {String(row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 30 && (
              <p className="text-xs text-slate-500 p-2 text-center">
                {lang === "en"
                  ? `Showing first 30 of ${previewData.length} rows`
                  : `Memaparkan 30 pertama daripada ${previewData.length} baris`}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
