"use client";

import { useState, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { DataSourceConfig } from "@/lib/data-sources";
import { exportToExcel } from "@/lib/export-excel";
import { ColumnDef } from "@/lib/types";
import { Lang, t } from "@/lib/translations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface DataExplorerProps {
  dataSources: DataSourceConfig[];
  lang: Lang;
}

export default function DataExplorer({ dataSources, lang }: DataExplorerProps) {
  const [selectedSource, setSelectedSource] = useState<string>(dataSources[0].id);
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showColumnFilters, setShowColumnFilters] = useState(true);

  const source: DataSourceConfig =
    dataSources.find((s) => s.id === selectedSource) || dataSources[0];

  const handleSourceChange = useCallback((id: string) => {
    setSelectedSource(id);
    setSearch("");
    setColumnFilters({});
    setSortKey("");
    setPage(0);
  }, []);

  const displayColumns: ColumnDef[] = source.columns;

  // Get unique values for each column (for dropdown filters)
  const columnUniqueValues = useMemo(() => {
    const result: Record<string, string[]> = {};
    source.columns.forEach((col) => {
      const values = [
        ...new Set(source.data.map((row) => String(row[col.key] ?? "")).filter(Boolean)),
      ].sort();
      // Use dropdown if 20 or fewer unique values, otherwise text input
      if (values.length <= 20) {
        result[col.key] = values;
      }
    });
    return result;
  }, [source]);

  // Apply all filters
  const filteredData: AnyRecord[] = useMemo(() => {
    let result = source.data as AnyRecord[];

    // Global text search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((row) =>
        source.columns.some((col) =>
          String(row[col.key] ?? "").toLowerCase().includes(lower)
        )
      );
    }

    // Per-column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (!value) return;
      const lower = value.toLowerCase();
      // If it's a dropdown column, exact match; otherwise substring
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

      {/* Search bar + controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
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

        {/* Table with Excel-like column filters */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {/* Column headers */}
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
              {/* Per-column filter row (Excel-like) */}
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
                    {displayColumns.map((col) => (
                      <td
                        key={col.key}
                        className="px-3 py-3 text-sm text-slate-700 max-w-xs truncate"
                        title={String(row[col.key] ?? "")}
                      >
                        {String(row[col.key] ?? "-")}
                      </td>
                    ))}
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
    </div>
  );
}
