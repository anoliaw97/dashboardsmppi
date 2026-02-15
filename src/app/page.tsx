"use client";

import { useState, useMemo } from "react";
import { Database, Globe } from "lucide-react";
import { getDataSources } from "@/lib/data-sources";
import { Lang, t } from "@/lib/translations";
import DataExplorer from "@/components/DataExplorer";

export default function Dashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const dataSources = useMemo(() => getDataSources(lang), [lang]);

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ms" : "en"));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">SMPPI Data Extractor</h1>
              <p className="text-xs text-slate-400">{t("subtitle", lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
            >
              <Globe size={16} className="text-blue-400" />
              <span className="font-medium">
                {lang === "en" ? "BM" : "EN"}
              </span>
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">{t("totalSources", lang)}</span>
              <span className="bg-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {dataSources.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        <DataExplorer dataSources={dataSources} lang={lang} />
      </div>
    </div>
  );
}
