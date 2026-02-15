"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Play,
  BookOpen,
  Search,
  Shield,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { DataSourceConfig } from "@/lib/data-sources";
import { Lang, t } from "@/lib/translations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

interface AiAssistantProps {
  dataSources: DataSourceConfig[];
  lang: Lang;
}

// Table name mapping for SQL generation
const tableNameMap: Record<string, string> = {
  pensyarah: "dbo.Pensyarah",
  pascasiswazah: "dbo.PelajarPascasiswazah",
  penyelidikan: "dbo.Penyelidikan",
  "harta-intelek": "dbo.HartaIntelek",
  penyeliaan: "dbo.Penyeliaan",
};

// Generate SQL from natural language (client-side simulation)
function generateSql(
  prompt: string,
  source: DataSourceConfig
): { sql: string; explanation: string } {
  const tableName = tableNameMap[source.id] || source.id;
  const columns = source.columns.map((c) => c.key);
  const lower = prompt.toLowerCase();

  // Parse common patterns
  const conditions: string[] = [];
  let selectedCols = "*";
  let orderBy = "";
  let limit = "";

  // Detect column references and values
  source.columns.forEach((col) => {
    const colLower = col.label.toLowerCase();
    const keyLower = col.key.toLowerCase();

    // Check for "where column = value" patterns
    const patterns = [
      new RegExp(`${colLower}\\s*(?:is|=|equals?)\\s*['"]?([\\w\\s]+?)['"]?(?:\\s|$|,|\\.)`, "i"),
      new RegExp(`${keyLower}\\s*(?:is|=|equals?)\\s*['"]?([\\w\\s]+?)['"]?(?:\\s|$|,|\\.)`, "i"),
      new RegExp(`with\\s+${colLower}\\s+['"]?([\\w\\s]+?)['"]?(?:\\s|$|,|\\.)`, "i"),
      new RegExp(`from\\s+(?:the\\s+)?${colLower}\\s+(?:of\\s+)?['"]?([\\w\\s]+?)['"]?(?:\\s|$|,|\\.)`, "i"),
    ];

    for (const pat of patterns) {
      const match = lower.match(pat);
      if (match) {
        conditions.push(`[${col.key}] = '${match[1].trim()}'`);
        break;
      }
    }

    // Check for numeric comparisons
    const numPatterns = [
      new RegExp(`${colLower}\\s*(?:more|greater|higher|above|>)\\s*(?:than)?\\s*(\\d+)`, "i"),
      new RegExp(`${colLower}\\s*(?:less|lower|below|<)\\s*(?:than)?\\s*(\\d+)`, "i"),
    ];

    const gtMatch = lower.match(numPatterns[0]);
    if (gtMatch) {
      conditions.push(`[${col.key}] > ${gtMatch[1]}`);
    }
    const ltMatch = lower.match(numPatterns[1]);
    if (ltMatch) {
      conditions.push(`[${col.key}] < ${ltMatch[1]}`);
    }
  });

  // Detect "list/show/get all" patterns
  if (lower.includes("count") || lower.includes("how many")) {
    selectedCols = "COUNT(*) AS TotalCount";
  } else if (lower.includes("name") && !lower.includes("all")) {
    const nameCol = columns.find(
      (c) => c.toLowerCase().includes("name") && !c.toLowerCase().includes("db")
    );
    if (nameCol) selectedCols = `[${nameCol}]`;
  }

  // Detect ordering
  if (lower.includes("sort by") || lower.includes("order by")) {
    const sortCol = columns.find((c) =>
      lower.includes(c.toLowerCase())
    );
    if (sortCol) {
      orderBy = `\nORDER BY [${sortCol}]`;
      if (lower.includes("desc") || lower.includes("highest") || lower.includes("most")) {
        orderBy += " DESC";
      } else {
        orderBy += " ASC";
      }
    }
  }

  // Detect top/limit
  const topMatch = lower.match(/(?:top|first|limit)\s*(\d+)/i);
  if (topMatch) {
    limit = `TOP ${topMatch[1]} `;
  }

  // Build the SQL
  const whereClause =
    conditions.length > 0 ? `\nWHERE ${conditions.join("\n  AND ")}` : "";
  const sql = `SELECT ${limit}${selectedCols}\nFROM ${tableName}${whereClause}${orderBy};`;

  const explanation =
    conditions.length > 0
      ? `This query retrieves data from ${source.label} with ${conditions.length} filter condition(s). The query is read-only (SELECT only).`
      : `This query retrieves all records from ${source.label}. The query is read-only (SELECT only).`;

  return { sql, explanation };
}

// Execute the generated SQL against mock data (client-side)
function executeMockQuery(
  sql: string,
  source: DataSourceConfig
): AnyRecord[] {
  let results = [...source.data] as AnyRecord[];

  // Parse WHERE conditions from the SQL
  const whereMatch = sql.match(new RegExp("WHERE\\s+(.+?)(?:\\s+ORDER|\\s*;|\\s*$)", "is"));
  if (whereMatch) {
    const conditionsStr = whereMatch[1];
    const condParts = conditionsStr.split(/\s+AND\s+/i);

    condParts.forEach((cond) => {
      const eqMatch = cond.match(/\[(\w+)]\s*=\s*'([^']+)'/);
      if (eqMatch) {
        const [, col, val] = eqMatch;
        results = results.filter(
          (row) =>
            String(row[col] ?? "").toLowerCase() === val.toLowerCase()
        );
      }
      const gtMatch = cond.match(/\[(\w+)]\s*>\s*(\d+)/);
      if (gtMatch) {
        const [, col, val] = gtMatch;
        results = results.filter(
          (row) => Number(row[col] ?? 0) > Number(val)
        );
      }
      const ltMatch = cond.match(/\[(\w+)]\s*<\s*(\d+)/);
      if (ltMatch) {
        const [, col, val] = ltMatch;
        results = results.filter(
          (row) => Number(row[col] ?? 0) < Number(val)
        );
      }
    });
  }

  // Parse TOP
  const topMatch = sql.match(/TOP\s+(\d+)/i);
  if (topMatch) {
    results = results.slice(0, Number(topMatch[1]));
  }

  return results;
}

// Simulated AI explanation
function generateExplanation(prompt: string, lang: Lang): string {
  const lower = prompt.toLowerCase();

  if (lower.includes("h-index") || lower.includes("h index")) {
    return lang === "en"
      ? `**H-index** is a metric that measures both the productivity and citation impact of a researcher's publications. A researcher has an H-index of *h* when *h* of their papers have been cited at least *h* times each.\n\n**Example:** An H-index of 8 means the researcher has 8 papers that have each been cited at least 8 times.\n\n**Typical ranges:**\n- 0-5: Early career researcher\n- 5-15: Established researcher\n- 15-30: Senior researcher with significant impact\n- 30+: Highly influential researcher`
      : `**H-index** ialah metrik yang mengukur produktiviti dan impak sitasi penerbitan seseorang penyelidik. Seseorang penyelidik mempunyai H-index *h* apabila *h* daripada kertas kerja mereka telah disitasi sekurang-kurangnya *h* kali setiap satu.\n\n**Contoh:** H-index 8 bermaksud penyelidik tersebut mempunyai 8 kertas kerja yang masing-masing telah disitasi sekurang-kurangnya 8 kali.\n\n**Julat tipikal:**\n- 0-5: Penyelidik awal kerjaya\n- 5-15: Penyelidik mantap\n- 15-30: Penyelidik senior dengan impak signifikan\n- 30+: Penyelidik sangat berpengaruh`;
  }

  if (lower.includes("gred") || lower.includes("grade") || lower.includes("dm54") || lower.includes("dm")) {
    return lang === "en"
      ? `**Academic Grade System (Malaysia Public Universities)**\n\nGrades like DM, DS, and DU refer to different academic position levels:\n\n- **DM** - Senior Lecturer / Associate Professor grade\n  - DM45, DM51, DM54 indicate salary scale within the grade\n- **DS** - Lecturer grade\n  - DS45, DS51, DS52 etc.\n- **DU** - Tutor/Teaching Assistant grade\n\n**DM54** specifically refers to an Associate Professor at the higher salary scale, typically indicating senior experience and tenure.`
      : `**Sistem Gred Akademik (Universiti Awam Malaysia)**\n\nGred seperti DM, DS, dan DU merujuk kepada tahap jawatan akademik yang berbeza:\n\n- **DM** - Gred Pensyarah Kanan / Profesor Madya\n  - DM45, DM51, DM54 menunjukkan skala gaji dalam gred tersebut\n- **DS** - Gred Pensyarah\n  - DS45, DS51, DS52 dll.\n- **DU** - Gred Tutor/Pembantu Pengajar\n\n**DM54** secara khusus merujuk kepada Profesor Madya pada skala gaji yang lebih tinggi, biasanya menunjukkan pengalaman senior dan tempoh perkhidmatan.`;
  }

  if (lower.includes("ptj") || lower.includes("pusat tanggungjawab")) {
    return lang === "en"
      ? `**PTJ (Pusat Tanggungjawab)** means "Responsibility Centre" in the Malaysian public university system.\n\nIt refers to a budget management unit within the university, typically a faculty, department, or administrative centre that is responsible for managing its own budget allocation and expenditure.\n\n**Examples:** Faculty of Engineering (PTJ code: A), Faculty of Science (PTJ code: B), etc.`
      : `**PTJ (Pusat Tanggungjawab)** ialah unit pengurusan belanjawan dalam sistem universiti awam Malaysia.\n\nIa merujuk kepada fakulti, jabatan, atau pusat pentadbiran yang bertanggungjawab menguruskan peruntukan dan perbelanjaan belanjawannya sendiri.\n\n**Contoh:** Fakulti Kejuruteraan (kod PTJ: A), Fakulti Sains (kod PTJ: B), dll.`;
  }

  if (lower.includes("patent") || lower.includes("paten") || lower.includes("intellectual property") || lower.includes("harta intelek")) {
    return lang === "en"
      ? `**Intellectual Property (IP)** in the university context includes:\n\n- **Patent** - Exclusive rights for an invention (product/process)\n- **Copyright** - Protection for original creative works\n- **Trademark** - Brand identity protection\n- **Industrial Design** - Protection for visual design of objects\n- **Trade Secret** - Confidential business information\n\n**Commercial Potential** ratings indicate the likelihood of generating revenue from the IP through licensing, sales, or spin-off companies.`
      : `**Harta Intelek (IP)** dalam konteks universiti termasuk:\n\n- **Paten** - Hak eksklusif untuk sesuatu ciptaan (produk/proses)\n- **Hak Cipta** - Perlindungan untuk karya kreatif asli\n- **Cap Dagangan** - Perlindungan identiti jenama\n- **Reka Bentuk Perindustrian** - Perlindungan untuk reka bentuk visual objek\n- **Rahsia Dagangan** - Maklumat perniagaan sulit\n\n**Potensi Komersial** menunjukkan kemungkinan menjana pendapatan daripada IP melalui pelesenan, jualan, atau syarikat spin-off.`;
  }

  // Default response
  return lang === "en"
    ? `I can help explain academic and research terminology. Try asking about:\n\n- **H-index** - Research impact metrics\n- **Academic grades** (DM, DS, DU) - Malaysian university grading\n- **PTJ** - Responsibility centres\n- **Intellectual Property** - Patents, copyrights, trademarks\n\nIn a production environment, this would connect to an AI service for comprehensive explanations using online search.`
    : `Saya boleh membantu menerangkan istilah akademik dan penyelidikan. Cuba tanya tentang:\n\n- **H-index** - Metrik impak penyelidikan\n- **Gred akademik** (DM, DS, DU) - Penggredan universiti Malaysia\n- **PTJ** - Pusat tanggungjawab\n- **Harta Intelek** - Paten, hak cipta, cap dagangan\n\nDalam persekitaran pengeluaran, ini akan disambungkan kepada perkhidmatan AI untuk penjelasan komprehensif menggunakan carian dalam talian.`;
}

// Sample queries per data source
const sampleQueries: Record<string, { en: string; ms: string }[]> = {
  pensyarah: [
    {
      en: "Show all lecturers with grade DM54",
      ms: "Tunjukkan semua pensyarah dengan gred DM54",
    },
    {
      en: "List female lecturers from department FKE",
      ms: "Senaraikan pensyarah wanita dari jabatan FKE",
    },
    {
      en: "How many active lecturers are there?",
      ms: "Berapa ramai pensyarah aktif?",
    },
  ],
  pascasiswazah: [
    {
      en: "Show all PhD students with status Active",
      ms: "Tunjukkan semua pelajar PhD dengan status Aktif",
    },
    {
      en: "List students with publications more than 3",
      ms: "Senaraikan pelajar dengan penerbitan lebih daripada 3",
    },
    {
      en: "Show students from Faculty of Engineering",
      ms: "Tunjukkan pelajar dari Fakulti Kejuruteraan",
    },
  ],
  penyelidikan: [
    {
      en: "Show all active research databases",
      ms: "Tunjukkan semua pangkalan data penyelidikan aktif",
    },
    {
      en: "List research with status Approved",
      ms: "Senaraikan penyelidikan dengan status Diluluskan",
    },
  ],
  "harta-intelek": [
    {
      en: "Show all patents with income more than 10000",
      ms: "Tunjukkan semua paten dengan pendapatan lebih 10000",
    },
    {
      en: "List IP with commercial potential High",
      ms: "Senaraikan IP dengan potensi komersial Tinggi",
    },
  ],
  penyeliaan: [
    {
      en: "Show all active supervisions",
      ms: "Tunjukkan semua penyeliaan aktif",
    },
    {
      en: "List main supervisors from Faculty of Science",
      ms: "Senaraikan penyelia utama dari Fakulti Sains",
    },
  ],
};

export default function AiAssistant({
  dataSources,
  lang,
}: AiAssistantProps) {
  const [activeTab, setActiveTab] = useState<"query" | "explain">("query");
  const [selectedSource, setSelectedSource] = useState<string>(
    dataSources[0].id
  );
  const [queryPrompt, setQueryPrompt] = useState("");
  const [explainPrompt, setExplainPrompt] = useState("");
  const [generatedSql, setGeneratedSql] = useState("");
  const [sqlExplanation, setSqlExplanation] = useState("");
  const [queryResults, setQueryResults] = useState<AnyRecord[] | null>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const source =
    dataSources.find((s) => s.id === selectedSource) || dataSources[0];

  const samples = useMemo(
    () => sampleQueries[selectedSource] || [],
    [selectedSource]
  );

  const handleGenerate = async () => {
    if (!queryPrompt.trim()) return;
    setLoading(true);
    setQueryResults(null);
    setShowResults(false);

    // Simulate async processing
    await new Promise((r) => setTimeout(r, 800));

    const result = generateSql(queryPrompt, source);
    setGeneratedSql(result.sql);
    setSqlExplanation(result.explanation);
    setLoading(false);
  };

  const handleRunQuery = async () => {
    if (!generatedSql) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 500));

    const results = executeMockQuery(generatedSql, source);
    setQueryResults(results);
    setShowResults(true);
    setLoading(false);
  };

  const handleExplain = async () => {
    if (!explainPrompt.trim()) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const result = generateExplanation(explainPrompt, lang);
    setExplanation(result);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles size={24} />
          <h2 className="text-xl font-bold">{t("aiTitle", lang)}</h2>
        </div>
        <p className="text-purple-100 text-sm">{t("aiSubtitle", lang)}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-purple-200">
          <Shield size={14} />
          <span>{t("aiReadOnlyNote", lang)}</span>
        </div>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("query")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "query"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Search size={16} />
          {t("aiQueryTab", lang)}
        </button>
        <button
          onClick={() => setActiveTab("explain")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === "explain"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen size={16} />
          {t("aiExplainTab", lang)}
        </button>
      </div>

      {/* Query Builder tab */}
      {activeTab === "query" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          {/* Database selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {t("aiSelectDb", lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              {dataSources.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => {
                    setSelectedSource(ds.id);
                    setGeneratedSql("");
                    setQueryResults(null);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedSource === ds.id
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {ds.label}
                </button>
              ))}
            </div>
          </div>

          {/* Natural language input */}
          <div>
            <textarea
              rows={3}
              placeholder={t("aiQueryPlaceholder", lang)}
              value={queryPrompt}
              onChange={(e) => setQueryPrompt(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={handleGenerate}
                disabled={!queryPrompt.trim() || loading}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {t("aiGenerate", lang)}
              </button>
            </div>
          </div>

          {/* Sample queries */}
          {!generatedSql && samples.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">
                {t("aiSampleQueries", lang)}
              </p>
              <div className="flex flex-wrap gap-2">
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
            </div>
          )}

          {/* Generated SQL */}
          {generatedSql && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  {t("aiGeneratedSql", lang)}
                </h3>
                <pre className="bg-slate-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
                  {generatedSql}
                </pre>
                <p className="text-xs text-slate-500 mt-2">{sqlExplanation}</p>
              </div>

              <button
                onClick={handleRunQuery}
                disabled={loading}
                className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                {t("aiRunQuery", lang)}
              </button>

              {/* Query Results */}
              {queryResults !== null && (
                <div>
                  <button
                    onClick={() => setShowResults(!showResults)}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2"
                  >
                    {t("aiResults", lang)} ({queryResults.length}{" "}
                    {t("records", lang)})
                    {showResults ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                  {showResults && queryResults.length > 0 && (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full">
                        <thead>
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
                          {queryResults.slice(0, 20).map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50">
                              <td className="px-3 py-2 text-sm text-slate-400">
                                {idx + 1}
                              </td>
                              {source.columns.map((col) => (
                                <td
                                  key={col.key}
                                  className="px-3 py-2 text-sm text-slate-700 max-w-xs truncate"
                                >
                                  {String(row[col.key] ?? "-")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {queryResults.length > 20 && (
                        <p className="text-xs text-slate-500 p-3 text-center">
                          {lang === "en"
                            ? `Showing first 20 of ${queryResults.length} results`
                            : `Memaparkan 20 pertama daripada ${queryResults.length} keputusan`}
                        </p>
                      )}
                    </div>
                  )}
                  {showResults && queryResults.length === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      {t("noRecords", lang)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Explain Data tab */}
      {activeTab === "explain" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div>
            <textarea
              rows={3}
              placeholder={t("aiExplainPlaceholder", lang)}
              value={explainPrompt}
              onChange={(e) => setExplainPrompt(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleExplain}
              disabled={!explainPrompt.trim() || loading}
              className="mt-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <BookOpen size={16} />
              )}
              {t("aiExplain", lang)}
            </button>
          </div>

          {/* Quick topics */}
          {!explanation && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">
                {t("aiSampleQueries", lang)}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { en: "What is H-index?", ms: "Apa itu H-index?" },
                  {
                    en: "Explain grade DM54",
                    ms: "Terangkan gred DM54",
                  },
                  { en: "What is PTJ?", ms: "Apa itu PTJ?" },
                  {
                    en: "Explain intellectual property types",
                    ms: "Terangkan jenis harta intelek",
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setExplainPrompt(item[lang])}
                    className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    {item[lang]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explanation result */}
          {explanation && (
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                {t("aiExplanation", lang)}
              </h3>
              <div className="prose prose-sm max-w-none bg-slate-50 rounded-xl p-4 border border-slate-200">
                {explanation.split("\n").map((line, idx) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return (
                      <h4 key={idx} className="font-bold text-slate-800 mt-2">
                        {line.replace(/\*\*/g, "")}
                      </h4>
                    );
                  }
                  if (line.startsWith("- **")) {
                    const parts = line.match(/^- \*\*(.+?)\*\*\s*-?\s*(.*)/);
                    if (parts) {
                      return (
                        <p key={idx} className="ml-2 text-sm text-slate-700">
                          <strong>{parts[1]}</strong>
                          {parts[2] ? ` - ${parts[2]}` : ""}
                        </p>
                      );
                    }
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <p key={idx} className="ml-4 text-sm text-slate-600">
                        {line}
                      </p>
                    );
                  }
                  if (line.trim() === "") return <br key={idx} />;
                  return (
                    <p key={idx} className="text-sm text-slate-700">
                      {line.replace(/\*\*(.+?)\*\*/g, "").includes("*")
                        ? line
                        : line.split(/\*\*/).map((part, i) =>
                            i % 2 === 1 ? (
                              <strong key={i}>{part}</strong>
                            ) : (
                              <span key={i}>
                                {part.split(/\*(.+?)\*/).map((p, j) =>
                                  j % 2 === 1 ? (
                                    <em key={j}>{p}</em>
                                  ) : (
                                    <span key={j}>{p}</span>
                                  )
                                )}
                              </span>
                            )
                          )}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
