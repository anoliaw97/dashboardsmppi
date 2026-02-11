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
  Database,
  SlidersHorizontal,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";
import { dataSources, DataSourceConfig } from "@/lib/data-sources";
import { exportToExcel } from "@/lib/export-excel";
import { ColumnDef } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export default function Dashboard() {
  const [selectedSource, setSelectedSource] = useState<string>(dataSources[0].id);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDateCol, setSelectedDateCol] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [showColumnPicker, setShowColumnPicker] = useState(false);

  const source: DataSourceConfig = dataSources.find((s) => s.id === selectedSource) || dataSources[0];

  // Reset state when data source changes
  const handleSourceChange = useCallback((id: string) => {
    setSelectedSource(id);
    setSearch("");
    setFilters({});
    setDateFrom("");
    setDateTo("");
    setSelectedDateCol("");
    setSortKey("");
    setPage(0);
    setShowFilters(false);
    setVisibleColumns([]);
    setShowColumnPicker(false);
  }, []);

  // Columns to display (all if none selected)
  const displayColumns: ColumnDef[] = useMemo(() => {
    if (visibleColumns.length === 0) return source.columns;
    return source.columns.filter((c) => visibleColumns.includes(c.key));
  }, [source.columns, visibleColumns]);

  // Filter options for dropdown filters
  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    source.filterColumns.forEach((col) => {
      const values = [...new Set(source.data.map((row) => String(row[col] ?? "")))].filter(Boolean).sort();
      opts[col] = values;
    });
    return opts;
  }, [source]);

  // Filtered + searched data
  const filteredData: AnyRecord[] = useMemo(() => {
    let result = source.data as AnyRecord[];

    // Text search across all columns
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((row) =>
        source.columns.some((col) =>
          String(row[col.key] ?? "").toLowerCase().includes(lower)
        )
      );
    }

    // Dropdown filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => String(row[key]) === value);
      }
    });

    // Date range filter
    if (selectedDateCol && (dateFrom || dateTo)) {
      result = result.filter((row) => {
        const val = String(row[selectedDateCol] ?? "");
        if (!val) return false;
        if (dateFrom && val < dateFrom) return false;
        if (dateTo && val > dateTo) return false;
        return true;
      });
    }

    return result;
  }, [source, search, filters, selectedDateCol, dateFrom, dateTo]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortKey] ?? "");
      const bVal = String(b[sortKey] ?? "");
      const cmp = aVal.localeCompare(bVal, "ms", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

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
    exportToExcel(source.data as AnyRecord[], `${source.id}_semua`, source.label);
  };

  const handleExportFiltered = () => {
    exportToExcel(sortedData, `${source.id}_ditapis`, source.label);
  };

  const resetAll = () => {
    setSearch("");
    setFilters({});
    setDateFrom("");
    setDateTo("");
    setSelectedDateCol("");
    setSortKey("");
    setPage(0);
  };

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length +
    (search ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      if (prev.length === 0) {
        // First time toggling: start from all columns minus this one
        return source.columns.map((c) => c.key).filter((k) => k !== key);
      }
      return prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">SMPPI Data Extractor</h1>
              <p className="text-xs text-slate-400">
                Cari & Eksport Data dari Pelbagai Pangkalan Data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Jumlah sumber data:</span>
            <span className="bg-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
              {dataSources.length}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6">
        {/* ============ SEARCH ENGINE AREA ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          {/* Data source selector row */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Sumber Data
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

          {/* Search bar */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder={`Cari dalam ${source.label}...`}
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
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                showFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal size={16} />
              Tapis
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                showColumnPicker
                  ? "bg-purple-50 border-purple-300 text-purple-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <FileSpreadsheet size={16} />
              Lajur
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Dropdown filters */}
                {source.filterColumns.map((col) => {
                  const colDef = source.columns.find((c) => c.key === col);
                  return (
                    <div key={col}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">
                        {colDef?.label || col}
                      </label>
                      <select
                        value={filters[col] || ""}
                        onChange={(e) => {
                          setFilters({ ...filters, [col]: e.target.value });
                          setPage(0);
                        }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Semua</option>
                        {filterOptions[col]?.map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Date range filter */}
              {source.dateColumns.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <label className="block text-xs font-medium text-slate-500 mb-2">
                    Tapis Mengikut Tarikh
                  </label>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Lajur Tarikh
                      </label>
                      <select
                        value={selectedDateCol}
                        onChange={(e) => {
                          setSelectedDateCol(e.target.value);
                          setPage(0);
                        }}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Pilih lajur --</option>
                        {source.dateColumns.map((dc) => {
                          const label = source.columns.find((c) => c.key === dc)?.label || dc;
                          return (
                            <option key={dc} value={dc}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Dari
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => {
                          setDateFrom(e.target.value);
                          setPage(0);
                        }}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Hingga
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => {
                          setDateTo(e.target.value);
                          setPage(0);
                        }}
                        className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Clear all filters */}
              {activeFilterCount > 0 && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={resetAll}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <RotateCcw size={14} />
                    Set Semula Semua Penapis
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Column Picker */}
          {showColumnPicker && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">
                  Pilih lajur untuk dipaparkan:
                </span>
                <button
                  onClick={() => setVisibleColumns([])}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Papar Semua
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {source.columns.map((col) => {
                  const isActive =
                    visibleColumns.length === 0 || visibleColumns.includes(col.key);
                  return (
                    <button
                      key={col.key}
                      onClick={() => toggleColumn(col.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-400 border border-slate-200 line-through"
                      }`}
                    >
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ============ RESULTS AREA ============ */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
          {/* Results header */}
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Keputusan Carian
              </h2>
              <p className="text-sm text-slate-500">
                {sortedData.length} daripada {source.data.length} rekod
                {activeFilterCount > 0 && (
                  <span className="ml-1 text-blue-600">
                    ({activeFilterCount} penapis aktif)
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
                Eksport Semua ({source.data.length})
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleExportFiltered}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Eksport Ditapis ({sortedData.length})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    #
                  </th>
                  {displayColumns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700"
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
                        <p className="text-sm">Tiada rekod ditemui</p>
                        <p className="text-xs mt-1">
                          Cuba ubah carian atau penapis anda
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {page * pageSize + idx + 1}
                      </td>
                      {displayColumns.map((col) => (
                        <td
                          key={col.key}
                          className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate"
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
              <span>Baris per halaman:</span>
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
                Halaman {page + 1} / {totalPages}
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
    </div>
  );
}
