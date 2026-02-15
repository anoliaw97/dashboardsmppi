import { DataSourceConfig } from "./data-sources";
import { Lang } from "./translations";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// Table name mapping for SQL generation
const tableNameMap: Record<string, string> = {
  pensyarah: "dbo.Pensyarah",
  pascasiswazah: "dbo.PelajarPascasiswazah",
  penyelidikan: "dbo.Penyelidikan",
  "harta-intelek": "dbo.HartaIntelek",
  penyeliaan: "dbo.Penyeliaan",
};

export function generateSql(
  prompt: string,
  source: DataSourceConfig
): { sql: string; explanation: string } {
  const tableName = tableNameMap[source.id] || source.id;
  const columns = source.columns.map((c) => c.key);
  const lower = prompt.toLowerCase();

  const conditions: string[] = [];
  let selectedCols = "*";
  let orderBy = "";
  let limit = "";

  source.columns.forEach((col) => {
    const colLower = col.label.toLowerCase();
    const keyLower = col.key.toLowerCase();

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

    const numPatterns = [
      new RegExp(`${colLower}\\s*(?:more|greater|higher|above|>)\\s*(?:than)?\\s*(\\d+)`, "i"),
      new RegExp(`${colLower}\\s*(?:less|lower|below|<)\\s*(?:than)?\\s*(\\d+)`, "i"),
    ];

    const gtMatch = lower.match(numPatterns[0]);
    if (gtMatch) conditions.push(`[${col.key}] > ${gtMatch[1]}`);
    const ltMatch = lower.match(numPatterns[1]);
    if (ltMatch) conditions.push(`[${col.key}] < ${ltMatch[1]}`);
  });

  if (lower.includes("count") || lower.includes("how many")) {
    selectedCols = "COUNT(*) AS TotalCount";
  } else if (lower.includes("name") && !lower.includes("all")) {
    const nameCol = columns.find(
      (c) => c.toLowerCase().includes("name") && !c.toLowerCase().includes("db")
    );
    if (nameCol) selectedCols = `[${nameCol}]`;
  }

  if (lower.includes("sort by") || lower.includes("order by")) {
    const sortCol = columns.find((c) => lower.includes(c.toLowerCase()));
    if (sortCol) {
      orderBy = `\nORDER BY [${sortCol}]`;
      if (lower.includes("desc") || lower.includes("highest") || lower.includes("most")) {
        orderBy += " DESC";
      } else {
        orderBy += " ASC";
      }
    }
  }

  const topMatch = lower.match(/(?:top|first|limit)\s*(\d+)/i);
  if (topMatch) limit = `TOP ${topMatch[1]} `;

  const whereClause =
    conditions.length > 0 ? `\nWHERE ${conditions.join("\n  AND ")}` : "";
  const sql = `SELECT ${limit}${selectedCols}\nFROM ${tableName}${whereClause}${orderBy};`;

  const explanation =
    conditions.length > 0
      ? `This query retrieves data from ${source.label} with ${conditions.length} filter condition(s). The query is read-only (SELECT only).`
      : `This query retrieves all records from ${source.label}. The query is read-only (SELECT only).`;

  return { sql, explanation };
}

export function executeMockQuery(
  sql: string,
  source: DataSourceConfig
): AnyRecord[] {
  let results = [...source.data] as AnyRecord[];

  const whereMatch = sql.match(
    new RegExp("WHERE\\s+(.+?)(?:\\s+ORDER|\\s*;|\\s*$)", "is")
  );
  if (whereMatch) {
    const conditionsStr = whereMatch[1];
    const condParts = conditionsStr.split(/\s+AND\s+/i);

    condParts.forEach((cond) => {
      const eqMatch = cond.match(/\[(\w+)]\s*=\s*'([^']+)'/);
      if (eqMatch) {
        const [, col, val] = eqMatch;
        results = results.filter(
          (row) => String(row[col] ?? "").toLowerCase() === val.toLowerCase()
        );
      }
      const gtMatch = cond.match(/\[(\w+)]\s*>\s*(\d+)/);
      if (gtMatch) {
        const [, col, val] = gtMatch;
        results = results.filter((row) => Number(row[col] ?? 0) > Number(val));
      }
      const ltMatch = cond.match(/\[(\w+)]\s*<\s*(\d+)/);
      if (ltMatch) {
        const [, col, val] = ltMatch;
        results = results.filter((row) => Number(row[col] ?? 0) < Number(val));
      }
    });
  }

  const topMatch = sql.match(/TOP\s+(\d+)/i);
  if (topMatch) results = results.slice(0, Number(topMatch[1]));

  return results;
}

export function generateExplanation(
  value: string,
  columnLabel: string,
  lang: Lang
): string {
  const lower = `${value} ${columnLabel}`.toLowerCase();

  if (lower.includes("dm") || lower.includes("ds") || lower.includes("du") || lower.includes("grade") || lower.includes("gred")) {
    const grade = value.trim();
    if (lang === "en") {
      if (grade.startsWith("DM")) return `Grade ${grade}: Senior Lecturer / Associate Professor level. DM grades (DM45, DM51, DM54) indicate salary scale, with higher numbers reflecting more seniority.`;
      if (grade.startsWith("DS")) return `Grade ${grade}: Lecturer level. DS grades (DS45, DS51, DS52) are for academic staff at the lecturer position.`;
      if (grade.startsWith("DU")) return `Grade ${grade}: Tutor / Teaching Assistant level.`;
      return `Academic grades in Malaysian public universities: DM = Senior Lecturer/Prof Madya, DS = Lecturer, DU = Tutor.`;
    }
    if (grade.startsWith("DM")) return `Gred ${grade}: Pensyarah Kanan / Profesor Madya. Gred DM (DM45, DM51, DM54) menunjukkan skala gaji, nombor lebih tinggi menunjukkan lebih kanan.`;
    if (grade.startsWith("DS")) return `Gred ${grade}: Pensyarah. Gred DS (DS45, DS51, DS52) untuk kakitangan akademik di jawatan pensyarah.`;
    if (grade.startsWith("DU")) return `Gred ${grade}: Tutor / Pembantu Pengajar.`;
    return `Gred akademik universiti awam Malaysia: DM = Pensyarah Kanan/Prof Madya, DS = Pensyarah, DU = Tutor.`;
  }

  if (lower.includes("aktif") || lower.includes("active")) {
    return lang === "en"
      ? `Status "Active" indicates this record is currently in effect and not archived, suspended, or terminated.`
      : `Status "Aktif" menunjukkan rekod ini sedang berkuat kuasa dan tidak diarkibkan, digantung, atau ditamatkan.`;
  }

  if (lower.includes("patent") || lower.includes("paten") || lower.includes("ip type") || lower.includes("jenis ip")) {
    return lang === "en"
      ? `"${value}" is an intellectual property type. Patents protect inventions, copyrights protect creative works, and trademarks protect brand identity.`
      : `"${value}" ialah jenis harta intelek. Paten melindungi ciptaan, hak cipta melindungi karya kreatif, dan cap dagangan melindungi identiti jenama.`;
  }

  if (lower.includes("ptj") || lower.includes("pusat tanggungjawab")) {
    return lang === "en"
      ? `PTJ (Pusat Tanggungjawab) = Responsibility Centre. "${value}" is a budget management unit within the university (faculty/department).`
      : `PTJ (Pusat Tanggungjawab) = Unit pengurusan belanjawan universiti. "${value}" ialah unit (fakulti/jabatan) yang menguruskan peruntukan belanjawannya.`;
  }

  if (columnLabel.toLowerCase().includes("date") || columnLabel.toLowerCase().includes("tarikh")) {
    return lang === "en"
      ? `Date value: ${value}. This is a ${columnLabel} timestamp in the system.`
      : `Nilai tarikh: ${value}. Ini ialah cap masa ${columnLabel} dalam sistem.`;
  }

  if (columnLabel.toLowerCase().includes("email") || columnLabel.toLowerCase().includes("emel")) {
    return lang === "en"
      ? `Email address: ${value}. This is the registered institutional email for this record.`
      : `Alamat emel: ${value}. Ini ialah emel institusi berdaftar untuk rekod ini.`;
  }

  // Generic
  return lang === "en"
    ? `Column "${columnLabel}" has value "${value}". In a production environment, this would connect to an AI service for a detailed explanation.`
    : `Lajur "${columnLabel}" bernilai "${value}". Dalam persekitaran pengeluaran, ini akan disambungkan ke perkhidmatan AI untuk penjelasan terperinci.`;
}

export const sampleQueries: Record<string, { en: string; ms: string }[]> = {
  pensyarah: [
    { en: "Show all lecturers with grade DM54", ms: "Tunjukkan semua pensyarah dengan gred DM54" },
    { en: "List female lecturers from department FKE", ms: "Senaraikan pensyarah wanita dari jabatan FKE" },
    { en: "How many active lecturers are there?", ms: "Berapa ramai pensyarah aktif?" },
  ],
  pascasiswazah: [
    { en: "Show all PhD students with status Active", ms: "Tunjukkan semua pelajar PhD dengan status Aktif" },
    { en: "List students with publications more than 3", ms: "Senaraikan pelajar dengan penerbitan lebih daripada 3" },
  ],
  penyelidikan: [
    { en: "Show all active research databases", ms: "Tunjukkan semua pangkalan data penyelidikan aktif" },
    { en: "List research with status Approved", ms: "Senaraikan penyelidikan dengan status Diluluskan" },
  ],
  "harta-intelek": [
    { en: "Show all patents with income more than 10000", ms: "Tunjukkan semua paten dengan pendapatan lebih 10000" },
    { en: "List IP with commercial potential High", ms: "Senaraikan IP dengan potensi komersial Tinggi" },
  ],
  penyeliaan: [
    { en: "Show all active supervisions", ms: "Tunjukkan semua penyeliaan aktif" },
    { en: "List main supervisors from Faculty of Science", ms: "Senaraikan penyelia utama dari Fakulti Sains" },
  ],
};
