"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ColumnDef } from "@/lib/types";
import { Lang, t } from "@/lib/translations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface VisualizationProps {
  data: AnyRecord[];
  columns: ColumnDef[];
  lang: Lang;
  sourceLabel: string;
}

type ChartType = "bar" | "line" | "pie" | "scatter";
type Aggregation = "count" | "sum" | "avg";

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#f97316",
  "#84cc16", "#a855f7",
];

function aggregateData(
  data: AnyRecord[],
  xCol: string,
  yCol: string,
  agg: Aggregation
): { name: string; value: number }[] {
  const groups = new Map<string, number[]>();

  data.forEach((row) => {
    const key = String(row[xCol] ?? "Unknown");
    if (!groups.has(key)) groups.set(key, []);
    if (agg === "count") {
      groups.get(key)!.push(1);
    } else {
      const val = Number(row[yCol]);
      if (!isNaN(val)) groups.get(key)!.push(val);
    }
  });

  const result: { name: string; value: number }[] = [];
  groups.forEach((values, name) => {
    let value: number;
    if (agg === "count") {
      value = values.length;
    } else if (agg === "sum") {
      value = values.reduce((a, b) => a + b, 0);
    } else {
      value = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    }
    result.push({ name, value: Math.round(value * 100) / 100 });
  });

  return result.sort((a, b) => b.value - a.value);
}

function getScatterData(
  data: AnyRecord[],
  xCol: string,
  yCol: string
): { x: number; y: number; label: string }[] {
  return data
    .map((row) => ({
      x: Number(row[xCol]),
      y: Number(row[yCol]),
      label: String(row[xCol]),
    }))
    .filter((d) => !isNaN(d.x) && !isNaN(d.y));
}

// Detect if a column is numeric
function isNumericColumn(data: AnyRecord[], key: string): boolean {
  const sample = data.slice(0, 20);
  const numCount = sample.filter((r) => {
    const v = r[key];
    return v !== null && v !== undefined && v !== "" && !isNaN(Number(v));
  }).length;
  return numCount > sample.length * 0.5;
}

export default function Visualization({
  data,
  columns,
  lang,
  sourceLabel,
}: VisualizationProps) {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [agg, setAgg] = useState<Aggregation>("count");
  const [generated, setGenerated] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const numericCols = useMemo(
    () => columns.filter((c) => isNumericColumn(data, c.key)),
    [data, columns]
  );

  const categoricalCols = useMemo(
    () =>
      columns.filter((c) => {
        const uniq = new Set(data.map((r) => String(r[c.key] ?? "")));
        return uniq.size <= 30 && uniq.size > 1;
      }),
    [data, columns]
  );

  const chartData = useMemo(() => {
    if (!xCol) return [];
    if (chartType === "scatter") {
      return getScatterData(data, xCol, yCol);
    }
    return aggregateData(data, xCol, yCol, agg);
  }, [data, xCol, yCol, agg, chartType]);

  const handleGenerate = () => {
    if (!xCol) return;
    setGenerated(true);
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Smart suggestion based on available columns
    if (categoricalCols.length > 0) {
      const statusCol = categoricalCols.find((c) =>
        c.key.toLowerCase().includes("status")
      );
      const deptCol = categoricalCols.find(
        (c) =>
          c.key.toLowerCase().includes("dept") ||
          c.key.toLowerCase().includes("faculty")
      );
      const suggestedX = statusCol || deptCol || categoricalCols[0];
      setXCol(suggestedX.key);

      if (numericCols.length > 0) {
        setYCol(numericCols[0].key);
        setAgg("sum");
        setChartType("bar");
      } else {
        setAgg("count");
        setChartType("pie");
      }
    } else if (numericCols.length >= 2) {
      setXCol(numericCols[0].key);
      setYCol(numericCols[1].key);
      setChartType("scatter");
    }

    setGenerated(true);
    setAiLoading(false);
  };

  const chartTypes: { type: ChartType; icon: typeof BarChart3; labelKey: "vizBar" | "vizLine" | "vizPie" | "vizScatter" }[] = [
    { type: "bar", icon: BarChart3, labelKey: "vizBar" },
    { type: "line", icon: LineChartIcon, labelKey: "vizLine" },
    { type: "pie", icon: PieChartIcon, labelKey: "vizPie" },
    { type: "scatter", icon: BarChart3, labelKey: "vizScatter" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              {t("vizTitle", lang)}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("vizSubtitle", lang)} — {sourceLabel} ({data.length}{" "}
            {t("records", lang)})
          </p>
        </div>
        <button
          onClick={handleAiSuggest}
          disabled={aiLoading}
          className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
        >
          {aiLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {t("vizAiSuggest", lang)}
        </button>
      </div>

      {/* Chart config */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Chart type */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            {t("vizChartType", lang)}
          </p>
          <div className="flex gap-1">
            {chartTypes.map((ct) => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.type}
                  onClick={() => {
                    setChartType(ct.type);
                    setGenerated(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                    chartType === ct.type
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <Icon size={14} />
                  {t(ct.labelKey, lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* X-Axis */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">
            {t("vizXAxis", lang)}
          </p>
          <select
            value={xCol}
            onChange={(e) => {
              setXCol(e.target.value);
              setGenerated(false);
            }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">{t("vizSelectColumn", lang)}</option>
            {(chartType === "scatter" ? numericCols : columns).map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </div>

        {/* Y-Axis / Aggregation */}
        {chartType !== "pie" && (
          <>
            {chartType === "scatter" ? (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {t("vizYAxis", lang)}
                </p>
                <select
                  value={yCol}
                  onChange={(e) => {
                    setYCol(e.target.value);
                    setGenerated(false);
                  }}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t("vizSelectColumn", lang)}</option>
                  {numericCols.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {t("vizAggregation", lang)}
                </p>
                <div className="flex gap-1">
                  {(["count", "sum", "avg"] as Aggregation[]).map((a) => (
                    <button
                      key={a}
                      onClick={() => {
                        setAgg(a);
                        setGenerated(false);
                      }}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        agg === a
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                      }`}
                    >
                      {t(
                        a === "count"
                          ? "vizCount"
                          : a === "sum"
                            ? "vizSum"
                            : "vizAvg",
                        lang
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {agg !== "count" && chartType !== "scatter" && (
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {t("vizYAxis", lang)}
                </p>
                <select
                  value={yCol}
                  onChange={(e) => {
                    setYCol(e.target.value);
                    setGenerated(false);
                  }}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t("vizSelectColumn", lang)}</option>
                  {numericCols.map((col) => (
                    <option key={col.key} value={col.key}>
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <button
          onClick={handleGenerate}
          disabled={!xCol}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
        >
          <BarChart3 size={14} />
          {t("vizGenerate", lang)}
        </button>
      </div>

      {/* Chart render */}
      {generated && chartData.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    name={agg === "count" ? t("vizCount", lang) : yCol || t("vizCount", lang)}
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={agg === "count" ? t("vizCount", lang) : yCol || t("vizCount", lang)}
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              ) : chartType === "pie" ? (
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 12)}
                    cx="50%"
                    cy="50%"
                    labelLine
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {chartData.slice(0, 12).map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="x"
                    name={xCol}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    dataKey="y"
                    name={yCol}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter
                    name={`${xCol} vs ${yCol}`}
                    data={chartData}
                    fill="#06b6d4"
                  />
                </ScatterChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {generated && chartData.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-8 italic">
          {t("vizNoData", lang)}
        </p>
      )}

      {!generated && (
        <p className="text-sm text-slate-400 text-center py-8">
          {t("vizNoData", lang)}
        </p>
      )}
    </div>
  );
}
