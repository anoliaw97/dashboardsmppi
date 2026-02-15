"use client";

import { useState, useMemo } from "react";
import { Database, Globe, Table2, Sparkles, FileText } from "lucide-react";
import { getDataSources } from "@/lib/data-sources";
import { Lang, t } from "@/lib/translations";
import DataExplorer from "@/components/DataExplorer";
import AiAssistant from "@/components/AiAssistant";
import RequestForm from "@/components/RequestForm";

type Tab = "explorer" | "ai" | "request";

export default function Dashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [activeTab, setActiveTab] = useState<Tab>("explorer");
  const dataSources = useMemo(() => getDataSources(lang), [lang]);

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ms" : "en"));

  const tabs: { id: Tab; labelKey: "tabDataExplorer" | "tabAiAssistant" | "tabRequestForm"; icon: typeof Table2 }[] = [
    { id: "explorer", labelKey: "tabDataExplorer", icon: Table2 },
    { id: "ai", labelKey: "tabAiAssistant", icon: Sparkles },
    { id: "request", labelKey: "tabRequestForm", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Header Bar */}
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

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 px-6 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon size={16} />
                {t(tab.labelKey, lang)}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <div className="max-w-[1600px] mx-auto p-6">
        {activeTab === "explorer" && (
          <DataExplorer dataSources={dataSources} lang={lang} />
        )}
        {activeTab === "ai" && (
          <AiAssistant dataSources={dataSources} lang={lang} />
        )}
        {activeTab === "request" && (
          <RequestForm dataSources={dataSources} lang={lang} />
        )}
      </div>
    </div>
  );
}
