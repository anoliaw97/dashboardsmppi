using SmppiDashboard.Models;
using System.Text.RegularExpressions;

namespace SmppiDashboard.Services;

public interface IAiQueryService
{
    AiQueryResult GenerateSql(AiQueryRequest request, DataSourceInfo source);
    string GenerateExplanation(ExplainRequest request);
    List<string> GetSampleQueries(string sourceId, string lang);
}

/// <summary>
/// Client-side NL-to-SQL generator.
/// Converts natural language prompts into safe, read-only SELECT statements
/// targeting the SMPPI SQL Server schema (dbo.*).
///
/// NOTE: In production, replace this with a real LLM API call (e.g., Azure OpenAI).
/// This is a deterministic regex-based approach for demo purposes.
/// </summary>
public class AiQueryService : IAiQueryService
{
    private static readonly Dictionary<string, string> _tableMap = new()
    {
        ["pensyarah"]     = "dbo.Pensyarah",
        ["pascasiswazah"] = "dbo.Pascasiswazah",
        ["penyelidikan"]  = "dbo.Penyelidikan",
        ["harta-intelek"] = "dbo.HartaIntelek",
        ["penyeliaan"]    = "dbo.Penyeliaan"
    };

    public AiQueryResult GenerateSql(AiQueryRequest request, DataSourceInfo source)
    {
        var tableName = _tableMap.GetValueOrDefault(request.SourceId, "dbo.UnknownTable");
        var prompt = request.Prompt.ToLower();
        var cols = source.Columns.Select(c => c.Key).ToList();

        var conditions = new List<string>();
        int? topN = null;
        bool isCount = false;
        string? orderByCol = null;
        bool orderDesc = false;

        // Detect COUNT
        if (Regex.IsMatch(prompt, @"\b(berapa|count|how many|jumlah rekod|number of)\b"))
            isCount = true;

        // Detect TOP N
        var topMatch = Regex.Match(prompt, @"\b(top|pertama|first)\s+(\d+)\b");
        if (topMatch.Success)
            topN = int.Parse(topMatch.Groups[2].Value);

        // Detect ORDER BY direction
        if (Regex.IsMatch(prompt, @"\b(terbesar|highest|desc|paling tinggi|maximum)\b"))
            orderDesc = true;

        // Detect ORDER BY column
        foreach (var col in cols)
        {
            if (prompt.Contains(col.ToLower()))
            {
                if (Regex.IsMatch(prompt, @"\b(sort|order|susun|arrange)\b"))
                    orderByCol = col;
            }
        }

        // Detect simple equality / LIKE conditions for string columns
        foreach (var col in source.Columns.Where(c => c.DataType == "string"))
        {
            // Pattern: "where ColName is/equals VALUE" or "kolum = value"
            var pattern = $@"\b{Regex.Escape(col.Key.ToLower())}\s*(?:is|=|equals?|ialah|sama dengan)?\s*['""]?([a-z0-9@._/\- ]+)['""]?\b";
            var m = Regex.Match(prompt, pattern, RegexOptions.IgnoreCase);
            if (m.Success && m.Groups[1].Value.Length < 60)
                conditions.Add($"[{col.Key}] LIKE '%{EscapeSql(m.Groups[1].Value.Trim())}%'");
        }

        // Detect numeric comparisons for decimal columns
        foreach (var col in source.Columns.Where(c => c.DataType == "decimal"))
        {
            var numMatch = Regex.Match(prompt,
                $@"\b{Regex.Escape(col.Key.ToLower())}\s*(>|<|>=|<=|=)\s*(\d+(?:\.\d+)?)\b",
                RegexOptions.IgnoreCase);
            if (numMatch.Success)
            {
                var op = numMatch.Groups[1].Value;
                var val = numMatch.Groups[2].Value;
                conditions.Add($"[{col.Key}] {op} {val}");
            }
        }

        // Detect status keywords
        var statusMap = new Dictionary<string, string>
        {
            ["aktif"] = "Aktif", ["active"] = "Aktif",
            ["tidak aktif"] = "Tidak Aktif", ["inactive"] = "Tidak Aktif",
            ["tamat"] = "Tamat", ["completed"] = "Tamat",
            ["dalam kemajuan"] = "Dalam Kemajuan", ["in progress"] = "Dalam Kemajuan",
        };

        foreach (var (keyword, value) in statusMap)
        {
            if (prompt.Contains(keyword))
            {
                var statusCol = cols.FirstOrDefault(c =>
                    c.ToLower().Contains("status")) ?? cols.First();
                if (!conditions.Any(c => c.Contains($"[{statusCol}]")))
                    conditions.Add($"[{statusCol}] = '{value}'");
                break;
            }
        }

        // Build SELECT
        var selectClause = isCount
            ? "COUNT(*) AS [JumlahRekod]"
            : (topN.HasValue ? $"TOP {topN}" : "TOP 1000") + "\n    " +
              string.Join(",\n    ", cols.Select(c => $"[{c}]"));

        var sql = $"SELECT {selectClause}\nFROM   {tableName} WITH (NOLOCK)";

        if (conditions.Count > 0)
            sql += $"\nWHERE  {string.Join("\n  AND  ", conditions)}";

        if (orderByCol != null)
            sql += $"\nORDER BY [{orderByCol}] {(orderDesc ? "DESC" : "ASC")}";

        sql += ";";

        var explanation = BuildExplanation(conditions, topN, isCount, orderByCol, orderDesc, request.Lang);

        return new AiQueryResult
        {
            Sql = sql,
            Explanation = explanation,
            IsReadOnly = true
        };
    }

    private static string BuildExplanation(
        List<string> conditions, int? topN, bool isCount,
        string? orderByCol, bool orderDesc, string lang)
    {
        bool ms = lang == "ms";

        if (isCount)
            return ms ? "Mengira jumlah rekod yang sepadan." : "Counting matching records.";

        var parts = new List<string>();

        if (topN.HasValue)
            parts.Add(ms ? $"Mengambil {topN} rekod pertama." : $"Fetching top {topN} records.");

        if (conditions.Any())
            parts.Add(ms
                ? $"Menapis mengikut: {string.Join(", ", conditions)}."
                : $"Filtering by: {string.Join(", ", conditions)}.");

        if (orderByCol != null)
            parts.Add(ms
                ? $"Menyusun mengikut {orderByCol} ({(orderDesc ? "tertinggi" : "terendah")})."
                : $"Sorted by {orderByCol} ({(orderDesc ? "descending" : "ascending")}).");

        if (!parts.Any())
            parts.Add(ms ? "Mengambil semua rekod (had 1000)." : "Fetching all records (limit 1000).");

        return string.Join(" ", parts);
    }

    public string GenerateExplanation(ExplainRequest request)
    {
        bool ms = request.Lang == "ms";
        var value = request.Value;
        var col = request.ColumnLabel.ToLower();

        // Grade (DM/DS/DU)
        if (Regex.IsMatch(value, @"^D[MSUFEJN]\d{2}$", RegexOptions.IgnoreCase))
        {
            var prefix = value[..2].ToUpper();
            var gradeDesc = prefix switch
            {
                "DM" => ms ? "Pensyarah (DM41–DM52)" : "Lecturer grade (DM41–DM52)",
                "DS" => ms ? "Saintis (DS45–DS54)" : "Scientist grade (DS45–DS54)",
                "DU" => ms ? "Doktor Perubatan Pergigian" : "Medical/Dental Officer",
                "DJ" => ms ? "Jurutera (J41–J54)" : "Engineering grade (J41–J54)",
                "DS" => ms ? "Saintis" : "Scientist",
                _ => ms ? $"Gred jawatan {prefix}" : $"Job grade {prefix}"
            };
            return ms
                ? $"Gred {value} ialah {gradeDesc}. Nombor menunjukkan tangga gaji dalam Perkhidmatan Awam Malaysia."
                : $"Grade {value} is {gradeDesc}. The number indicates the salary step within the Malaysian Civil Service.";
        }

        // Status fields
        if (col.Contains("status"))
        {
            return value.ToLower() switch
            {
                "aktif" => ms ? "Rekod ini aktif dan masih dalam perkhidmatan/pengajian." : "This record is active and currently in service/study.",
                "tidak aktif" => ms ? "Rekod ini tidak aktif, kemungkinan berhenti atau tamat tempoh." : "This record is inactive, possibly terminated or expired.",
                "tamat" => ms ? "Projek/pengajian ini telah tamat dengan jayanya." : "This project/study has been completed successfully.",
                "dalam kemajuan" => ms ? "Sedang berjalan. Belum mencapai tarikh tamat." : "Currently ongoing. Has not yet reached the end date.",
                _ => ms ? $"Status '{value}' menunjukkan keadaan semasa rekod ini." : $"Status '{value}' indicates the current state of this record."
            };
        }

        // Department/PTJ
        if (col.Contains("ptj") || col.Contains("department"))
        {
            return ms
                ? $"PTJ '{value}' merujuk kepada Pusat Tanggungjawab di universiti, iaitu unit organisasi yang bertanggungjawab ke atas kakitangan dan belanjawan."
                : $"'{value}' refers to a Responsibility Centre (PTJ) at the university — an organizational unit responsible for staff and budget management.";
        }

        // IP Type
        if (col.Contains("jenis") && col.Contains("intelek"))
        {
            return value.ToLower() switch
            {
                "paten" or "patent" => ms ? "Paten memberikan hak eksklusif ke atas rekacipta selama 20 tahun." : "A patent grants exclusive rights over an invention for 20 years.",
                "cap dagangan" or "trademark" => ms ? "Cap dagangan melindungi nama, logo atau tanda yang membezakan produk/perkhidmatan." : "A trademark protects names, logos, or signs distinguishing products/services.",
                "hakcipta" or "copyright" => ms ? "Hakcipta melindungi karya kreatif secara automatik tanpa pendaftaran." : "Copyright protects creative works automatically without registration.",
                _ => ms ? $"Jenis harta intelek: {value}." : $"Intellectual property type: {value}."
            };
        }

        // Date
        if (Regex.IsMatch(value, @"\d{4}-\d{2}-\d{2}"))
        {
            if (DateTime.TryParse(value, out var dt))
            {
                var relative = (DateTime.Now - dt).TotalDays;
                var relStr = relative > 365
                    ? (ms ? $"lebih {(int)(relative / 365)} tahun lalu" : $"over {(int)(relative / 365)} year(s) ago")
                    : relative > 0
                        ? (ms ? $"{(int)relative} hari lalu" : $"{(int)relative} days ago")
                        : (ms ? "akan datang" : "in the future");
                return ms
                    ? $"Tarikh: {dt:dd MMMM yyyy} ({relStr})."
                    : $"Date: {dt:dd MMMM yyyy} ({relStr}).";
            }
        }

        // Email
        if (value.Contains('@'))
        {
            var domain = value.Split('@').LastOrDefault() ?? "";
            return ms
                ? $"Alamat e-mel institusi. Domain '{domain}' mengesahkan bahawa pengguna adalah kakitangan/pelajar rasmi."
                : $"Institutional email address. Domain '{domain}' confirms the user is a registered staff/student.";
        }

        return ms
            ? $"Nilai '{value}' dalam lajur '{request.ColumnLabel}'."
            : $"Value '{value}' in column '{request.ColumnLabel}'.";
    }

    public List<string> GetSampleQueries(string sourceId, string lang)
    {
        bool ms = lang == "ms";
        return sourceId switch
        {
            "pensyarah" => ms
                ? new() { "Senaraikan pensyarah aktif", "Tunjukkan gred DM52", "Top 10 pensyarah PTJ FSKTM" }
                : new() { "List active lecturers", "Show grade DM52 staff", "Top 10 lecturers from FSKTM" },

            "pascasiswazah" => ms
                ? new() { "Pelajar PhD aktif", "Mod penyelidikan sesi 2023/2024", "Berapa pelajar program Master?" }
                : new() { "Active PhD students", "Research mode session 2023/2024", "How many Masters students?" },

            "penyelidikan" => ms
                ? new() { "Projek dalam kemajuan", "Geran melebihi 100000", "Top 5 geran terbesar" }
                : new() { "Projects in progress", "Grants above 100000", "Top 5 highest grants" },

            "harta-intelek" => ms
                ? new() { "Senaraikan semua paten", "Status permohonan granted", "Harta intelek cap dagangan" }
                : new() { "List all patents", "Status granted applications", "Trademark intellectual property" },

            "penyeliaan" => ms
                ? new() { "Penyeliaan aktif", "Penyelia utama sesi 2024/2025", "Berapa penyeliaan setiap penyelia?" }
                : new() { "Active supervision", "Main supervisor session 2024/2025", "How many supervisions per supervisor?" },

            _ => new()
        };
    }

    private static string EscapeSql(string value)
        => value.Replace("'", "''").Replace(";", "").Replace("--", "").Replace("/*", "").Replace("*/", "");
}
