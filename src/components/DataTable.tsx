"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { exportToExcel } from "@/lib/export-excel";
import { ColumnDef } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface DataTableProps {
  data: AnyRecord[];
  columns: ColumnDef[];
  title: string;
  exportFilename: string;
  filterColumns?: string[];
}

export default function DataTable({
  data,
  columns,
  title,
  exportFilename,
  filterColumns = [],
}: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filter columns
  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    filterColumns.forEach((col) => {
      const values = [...new Set(data.map((row) => String(row[col] ?? "")))].filter(Boolean).sort();
      opts[col] = values;
    });
    return opts;
  }, [data, filterColumns]);

  // Filter data
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) =>
          String(row[col.key] ?? "")
            .toLowerCase()
            .includes(lower)
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) => String(row[key]) === value);
      }
    });

    return result;
  }, [data, search, columns, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = String(a[sortKey] ?? "");
      const bVal = String(b[sortKey] ?? "");
      const cmp = aVal.localeCompare(bVal, "ms", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  // Paginate
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

  const handleExport = () => {
    const exportData = sortedData.length > 0 ? sortedData : data;
    exportToExcel(exportData, exportFilename, title);
  };

  const handleExportFiltered = () => {
    exportToExcel(sortedData, `${exportFilename}_filtered`, title);
  };

  const clearFilters = () => {
    setFilters({});
    setSearch("");
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            <p className="text-sm text-slate-500">
              {sortedData.length} daripada {data.length} rekod
              {activeFilterCount > 0 && (
                <span className="ml-2 text-blue-600">
                  ({activeFilterCount} penapis aktif)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Cari semua lajur..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
            {filterColumns.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border text-sm flex items-center gap-1 ${
                  showFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Filter size={16} />
                Tapis
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Eksport Excel
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={handleExportFiltered}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Eksport Ditapis
              </button>
            )}
          </div>
        </div>

        {/* Filter row */}
        {showFilters && filterColumns.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap gap-3 items-end">
              {filterColumns.map((col) => {
                const colDef = columns.find((c) => c.key === col);
                return (
                  <div key={col} className="flex flex-col">
                    <label className="text-xs text-slate-500 mb-1">
                      {colDef?.label || col}
                    </label>
                    <select
                      value={filters[col] || ""}
                      onChange={(e) => {
                        setFilters({ ...filters, [col]: e.target.value });
                        setPage(0);
                      }}
                      className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={14} />
                  Padam Semua Penapis
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    col.sortable !== false ? "cursor-pointer hover:text-slate-700" : ""
                  }`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Tiada rekod ditemui
                </td>
              </tr>
            ) : (
              pagedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {page * pageSize + idx + 1}
                  </td>
                  {columns.map((col) => (
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
  );
}
