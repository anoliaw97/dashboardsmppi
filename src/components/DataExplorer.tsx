"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Filter,
  Sparkles,
  Play,
  Shield,
  Loader2,
  BookOpen,
} from "lucide-react";
import { DataSourceConfig } from "@/lib/data-sources";
import { exportToExcel } from "@/lib/export-excel";
import { ColumnDef } from "@/lib/types";
import { Lang, t } from "@/lib/translations";
import {
  generateSql,
  executeMockQuery,
  generateExplanation,
  sampleQueries,
} from "@/lib/ai-helpers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface DataExplorerProps {
  dataSources: DataSourceConfig[];
  lang: Lang;
}

// Explain popover component
function ExplainPopover({
  value,
  columnLabel,
  lang,
  position,
  onClose,
}: {
  value: string;
  columnLabel: string;
  lang: Lang;
  position: { top: number; left: number };
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleExplain = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setExplanation(generateExplanation(value, columnLabel, lang));
    setLoading(false);
  };

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500">{columnLabel}</p>
          <p className="text-sm font-semibold text-slate-800 truncate">
            {value}
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-slate-600 flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {!explanation && !loading && (
        <button
          onClick={handleExplain}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <BookOpen size={14} />
          {lang === "en" ? "Explain this value" : "Terangkan nilai ini"}
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-2 text-purple-600">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">{t("aiProcessing", lang)}</span>
        </div>
      )}

      {explanation && (
        <div className="bg-purple-50 rounded-lg p-3 text-xs text-slate-700 border border-purple-100 leading-relaxed">
          {explanation}
        </div>
      )}
    </div>
  );
}

export default function DataExplorer({
  dataSources,
  lang,
}: DataExplorerProps) {
  const [selectedSource, setSelectedSource] = useState<string>(
    dataSources[0].id
  );
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>(
    {}
  );
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showColumnFilters, setShowColumnFilters] = useState(true);

  // AI Query Builder state
  const [showAiQuery, setShowAiQuery] = useState(false);
  const [queryPrompt, setQueryPrompt] = useState("");
  const [generatedSql, setGeneratedSql] = useState("");
  const [sqlExplanation, setSqlExplanation] = useState("");
  const [queryResults, setQueryResults] = useState<AnyRecord[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showQueryResults, setShowQueryResults] = useState(false);

  // Explain popover state
  const [explainPopover, setExplainPopover] = useState<{
    value: string;
    columnLabel: string;
    position: { top: number; left: number };
  } | null>(null);

  const source: DataSourceConfig =
    dataSources.find((s) => s.id === selectedSource) || dataSources[0];

  const handleSourceChange = useCallback((id: string) => {
    setSelectedSource(id);
    setSearch("");
    setColumnFilters({});
    setSortKey("");
    setPage(0);
    setGeneratedSql("");
    setQueryResults(null);
    setQueryPrompt("");
  }, []);

  const displayColumns: ColumnDef[] = source.columns;

  // Unique values per column for dropdown vs text filter
  const columnUniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    source.columns.forEach((col) => {
      const values = [
        ...new Set(
          source.data
            .map((row) => String(row[col.key] ?? ""))
            .filter(Boolean)
        ),
      ].sort();
      if (values.length <= 20) {
        result[col.key] = values;
      }
    });
    return result;
  }, [source]);

  // Filter data
  const filteredData: AnyRecord[] = useMemo(() => {
    let result = source.data as AnyRecord[];

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((row) =>
        source.columns.some((col) =>
          String(row[col.key] ?? "").toLowerCase().includes(lower)
        )
      );
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return;
      const lower = value.toLowerCase();
      if (columnUniqueValues[key]) {
        result = result.filter((row) => String(row[key] ?? "") === value);
      } else {
        result = result.filter((row) =>
          String(row[key] ?? "").toLowerCase().includes(lower)
        );
      }
    });

    return result;
  }, [source, search, columnFilters, columnUniqueValues]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortKey] ?? "");
      const bVal = String(b[sortKey] ?? "");
      const cmp = aVal.localeCompare(bVal, lang === "ms" ? "ms" : "en", {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir, lang]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pagedData = sortedData.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleExportAll = () => {
    exportToExcel(source.data as AnyRecord[], `${source.id}_all`, source.label);
  };

  const handleExportFiltered = () => {
    exportToExcel(sortedData, `${source.id}_filtered`, source.label);
  };

  const activeFilterCount =
    Object.values(columnFilters).filter(Boolean).length + (search ? 1 : 0);

  const resetAll = () => {
    setSearch("");
    setColumnFilters({});
    setSortKey("");
    setPage(0);
  };

  const setColumnFilter = (key: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  // AI handlers
  const samples = useMemo(
    () => sampleQueries[selectedSource] || [],
    [selectedSource]
  );

  const handleGenerate = async () => {
    if (!queryPrompt.trim()) return;
    setAiLoading(true);
    setQueryResults(null);
    setShowQueryResults(false);
    await new Promise((r) => setTimeout(r, 600));
    const result = generateSql(queryPrompt, source);
    setGeneratedSql(result.sql);
    setSqlExplanation(result.explanation);
    setAiLoading(false);
  };

  const handleRunQuery = async () => {
    if (!generatedSql) return;
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const results = executeMockQuery(generatedSql, source);
    setQueryResults(results);
    setShowQueryResults(true);
    setAiLoading(false);
  };

  // Cell click handler for explain popover
  const handleCellClick = (
    e: React.MouseEvent,
    value: string,
    columnLabel: string
  ) => {
    if (!value || value === "-") return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const popoverWidth = 320;
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth) {
      left = window.innerWidth - popoverWidth - 16;
    }
    let top = rect.bottom + 4;
    if (top + 200 > window.innerHeight) {
      top = rect.top - 200;
    }
    setExplainPopover({ value, columnLabel, position: { top, left } });
  };

  return (
    <div className="space-y-4">
      {/* Data source tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          {t("selectSource", lang)}
        </label>
        <div className="flex flex-wrap gap-2">
          {dataSources.map((ds) => (
            <button
              key={ds.id}
              onClick={() => handleSourceChange(ds.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                selectedSource === ds.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {ds.label}
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  selectedSource === ds.id
                    ? "bg-blue-500 text-blue-100"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {ds.data.length}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">{source.description}</p>
      </div>

      {/* Search bar + AI toggle + controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={t("globalSearch", lang)}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowColumnFilters(!showColumnFilters)}
            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
              showColumnFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={16} />
            {t("filter", lang)}
            {activeFilterCount > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowAiQuery(!showAiQuery)}
            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
              showAiQuery
                ? "bg-purple-50 border-purple-300 text-purple-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Sparkles size={16} />
            AI
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={resetAll}
              className="px-4 py-3 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2 text-red-600 hover:bg-red-50 transition-all"
            >
              <RotateCcw size={16} />
              {t("clearAll", lang)}
            </button>
          )}
        </div>

        {/* AI Query Builder (collapsible) */}
        {showAiQuery && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield size={12} />
              <span>{t("aiReadOnlyNote", lang)}</span>
            </div>
            <div className="flex gap-3 items-start">
              <textarea
                rows={2}
                placeholder={t("aiQueryPlaceholder", lang)}
                value={queryPrompt}
                onChange={(e) => setQueryPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={!queryPrompt.trim() || aiLoading}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {aiLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {t("aiGenerate", lang)}
              </button>
            </div>

            {/* Sample queries */}
            {!generatedSql && samples.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-slate-500 self-center">
                  {t("aiSampleQueries", lang)}
                </span>
                {samples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQueryPrompt(sample[lang])}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    {sample[lang]}
                  </button>
                ))}
              </div>
            )}

            {/* Generated SQL + Run */}
            {generatedSql && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    {t("aiGeneratedSql", lang)}
                  </p>
                  <pre className="bg-slate-900 text-green-400 p-3 rounded-xl text-xs font-mono overflow-x-auto">
                    {generatedSql}
                  </pre>
                  <p className="text-xs text-slate-400 mt-1">
                    {sqlExplanation}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunQuery}
                    disabled={aiLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {aiLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Play size={14} />
                    )}
                    {t("aiRunQuery", lang)}
                  </button>
                  {queryResults !== null && (
                    <button
                      onClick={() => setShowQueryResults(!showQueryResults)}
                      className="text-sm text-slate-600 flex items-center gap-1"
                    >
                      {t("aiResults", lang)} ({queryResults.length}{" "}
                      {t("records", lang)})
                      {showQueryResults ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  )}
                </div>

                {/* Inline query results */}
                {showQueryResults && queryResults && queryResults.length > 0 && (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-64 overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0">
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                            #
                          </th>
                          {source.columns.map((col) => (
                            <th
                              key={col.key}
                              className="px-3 py-2 text-left text-xs font-semibold text-slate-500 whitespace-nowrap"
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {queryResults.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className="hover:bg-purple-50/50">
                            <td className="px-3 py-1.5 text-xs text-slate-400">
                              {idx + 1}
                            </td>
                            {source.columns.map((col) => (
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
                  </div>
                )}
                {showQueryResults &&
                  queryResults &&
                  queryResults.length === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      {t("noRecords", lang)}
                    </p>
                  )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        {/* Results header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {t("searchResults", lang)}
            </h2>
            <p className="text-sm text-slate-500">
              {sortedData.length} {t("of", lang)} {source.data.length}{" "}
              {t("records", lang)}
              {activeFilterCount > 0 && (
                <span className="ml-1 text-blue-600">
                  ({activeFilterCount} {t("activeFilters", lang)})
                </span>
              )}
              <span className="ml-2 text-xs text-purple-500 italic">
                {lang === "en"
                  ? "Click any cell to explain"
                  : "Klik mana-mana sel untuk terangkan"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              {t("exportAll", lang)} ({source.data.length})
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={handleExportFiltered}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                {t("exportFiltered", lang)} ({sortedData.length})
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">
                  #
                </th>
                {displayColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700 select-none"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key &&
                        (sortDir === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
              {/* Per-column filter row */}
              {showColumnFilters && (
                <tr className="bg-blue-50/50 border-b border-slate-200">
                  <th className="px-3 py-2">
                    <Filter size={12} className="text-slate-400 mx-auto" />
                  </th>
                  {displayColumns.map((col) => (
                    <th key={col.key} className="px-2 py-2">
                      {columnUniqueValues[col.key] ? (
                        <select
                          value={columnFilters[col.key] || ""}
                          onChange={(e) =>
                            setColumnFilter(col.key, e.target.value)
                          }
                          className={`w-full border rounded px-2 py-1.5 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[80px] ${
                            columnFilters[col.key]
                              ? "border-blue-400 bg-blue-50 text-blue-800"
                              : "border-slate-300 bg-white text-slate-600"
                          }`}
                        >
                          <option value="">{t("all", lang)}</option>
                          {columnUniqueValues[col.key].map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t("filterPlaceholder", lang)}
                            value={columnFilters[col.key] || ""}
                            onChange={(e) =>
                              setColumnFilter(col.key, e.target.value)
                            }
                            className={`w-full border rounded px-2 py-1.5 text-xs font-normal focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[80px] ${
                              columnFilters[col.key]
                                ? "border-blue-400 bg-blue-50 text-blue-800"
                                : "border-slate-300 bg-white text-slate-600"
                            }`}
                          />
                          {columnFilters[col.key] && (
                            <button
                              onClick={() => setColumnFilter(col.key, "")}
                              className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={displayColumns.length + 1}
                    className="px-4 py-12 text-center"
                  >
                    <div className="text-slate-400">
                      <Search size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t("noRecords", lang)}</p>
                      <p className="text-xs mt-1">{t("tryChanging", lang)}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-3 py-3 text-sm text-slate-400">
                      {page * pageSize + idx + 1}
                    </td>
                    {displayColumns.map((col) => {
                      const cellVal = String(row[col.key] ?? "-");
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-3 text-sm text-slate-700 max-w-xs truncate cursor-pointer hover:text-purple-700 hover:underline decoration-dotted"
                          title={cellVal}
                          onClick={(e) =>
                            handleCellClick(e, cellVal, col.label)
                          }
                        >
                          {cellVal}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{t("rowsPerPage", lang)}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="border border-slate-300 rounded px-2 py-1 text-sm"
            >
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-slate-600 mr-2">
              {t("page", lang)} {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Explain Popover */}
      {explainPopover && (
        <ExplainPopover
          value={explainPopover.value}
          columnLabel={explainPopover.columnLabel}
          lang={lang}
          position={explainPopover.position}
          onClose={() => setExplainPopover(null)}
        />
      )}
    </div>
  );
}
