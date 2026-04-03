using DashboardSMPPI.Models;
using System.Text.RegularExpressions;

namespace DashboardSMPPI.Services;

public class AiHelperService
{
    private readonly MockDataService _mockData;

    public AiHelperService(MockDataService mockData)
    {
        _mockData = mockData;
    }

    // ── 1. GenerateSql ──────────────────────────────────────────────────
    public (string sql, string explanation) GenerateSql(string prompt, string sourceId)
    {
        var table = NormalizeTable(sourceId);
        var lower = prompt.Trim().ToLower();
        var config = DataSourceDefinitions.GetAll().FirstOrDefault(d => d.Id == sourceId);
        var columns = config?.Columns ?? new List<ColumnDef>();

        // ── count / group by ────────────────────────────────────────────
        var countMatch = Regex.Match(lower, @"count\s+(\w+)\s+by\s+(\w+)");
        if (countMatch.Success)
        {
            var groupCol = ResolveColumn(countMatch.Groups[2].Value, columns);
            return (
                $"SELECT {groupCol}, COUNT(*) FROM {table} GROUP BY {groupCol}",
                $"Count records grouped by {groupCol}."
            );
        }

        // ── top N ... order by ──────────────────────────────────────────
        var topMatch = Regex.Match(lower, @"top\s+(\d+)\s+.*?\s+by\s+(\w+)");
        if (topMatch.Success)
        {
            var n = topMatch.Groups[1].Value;
            var orderCol = ResolveColumn(topMatch.Groups[2].Value, columns);
            return (
                $"SELECT TOP {n} * FROM {table} ORDER BY {orderCol} DESC",
                $"Top {n} records ordered by {orderCol} descending."
            );
        }

        // ── find / show ... where column > value ────────────────────────
        var gtMatch = Regex.Match(lower, @"(?:with|where|having)\s+(\w[\w\s-]*?)\s+(?:above|greater than|more than|>)\s+(\d+)");
        if (gtMatch.Success)
        {
            var col = ResolveColumn(gtMatch.Groups[1].Value.Trim(), columns);
            var val = gtMatch.Groups[2].Value;
            return (
                $"SELECT * FROM {table} WHERE {col} > {val}",
                $"Records where {col} is greater than {val}."
            );
        }

        // ── less than / below ───────────────────────────────────────────
        var ltMatch = Regex.Match(lower, @"(?:with|where|having)\s+(\w[\w\s-]*?)\s+(?:below|less than|fewer than|<)\s+(\d+)");
        if (ltMatch.Success)
        {
            var col = ResolveColumn(ltMatch.Groups[1].Value.Trim(), columns);
            var val = ltMatch.Groups[2].Value;
            return (
                $"SELECT * FROM {table} WHERE {col} < {val}",
                $"Records where {col} is less than {val}."
            );
        }

        // ── equals filter (e.g. "show all active lecturers") ────────────
        var eqFilter = TryExtractEqualsFilter(lower, columns);
        if (eqFilter.HasValue)
        {
            return (
                $"SELECT * FROM {table} WHERE {eqFilter.Value.col} = '{eqFilter.Value.val}'",
                $"Records where {eqFilter.Value.col} equals '{eqFilter.Value.val}'."
            );
        }

        // ── order by (without top) ──────────────────────────────────────
        var orderMatch = Regex.Match(lower, @"(?:order|sort)\s+by\s+(\w+)\s*(asc|desc)?");
        if (orderMatch.Success)
        {
            var col = ResolveColumn(orderMatch.Groups[1].Value, columns);
            var dir = orderMatch.Groups[2].Success ? orderMatch.Groups[2].Value.ToUpper() : "ASC";
            return (
                $"SELECT * FROM {table} ORDER BY {col} {dir}",
                $"All records ordered by {col} {dir}."
            );
        }

        // ── limit ───────────────────────────────────────────────────────
        var limitMatch = Regex.Match(lower, @"(?:limit|first|show)\s+(\d+)");
        if (limitMatch.Success)
        {
            var n = limitMatch.Groups[1].Value;
            return (
                $"SELECT TOP {n} * FROM {table}",
                $"First {n} records from {table}."
            );
        }

        // ── fallback: select all ────────────────────────────────────────
        return (
            $"SELECT * FROM {table}",
            $"All records from {table}."
        );
    }

    // ── 2. ExecuteMockQuery ─────────────────────────────────────────────
    public List<Dictionary<string, string>> ExecuteMockQuery(string sql, string sourceId)
    {
        var data = _mockData.GetData(sourceId);
        if (data == null || data.Count == 0)
            return new List<Dictionary<string, string>>();

        var results = new List<Dictionary<string, string>>(data);

        // ── parse WHERE clause ──────────────────────────────────────────
        var whereMatch = Regex.Match(sql, @"WHERE\s+(\w+)\s*(=|>|<)\s*'?([^']+?)'?\s*(?:ORDER|GROUP|$)", RegexOptions.IgnoreCase);
        if (whereMatch.Success)
        {
            var col = whereMatch.Groups[1].Value;
            var op = whereMatch.Groups[2].Value;
            var val = whereMatch.Groups[3].Value.Trim();

            results = results.Where(row =>
            {
                if (!row.TryGetValue(col, out var cellValue))
                    return false;

                return op switch
                {
                    "=" => string.Equals(cellValue, val, StringComparison.OrdinalIgnoreCase),
                    ">" => double.TryParse(cellValue, out var a) && double.TryParse(val, out var b) && a > b,
                    "<" => double.TryParse(cellValue, out var x) && double.TryParse(val, out var y) && x < y,
                    _ => false
                };
            }).ToList();
        }

        // ── parse ORDER BY ──────────────────────────────────────────────
        var orderByMatch = Regex.Match(sql, @"ORDER\s+BY\s+(\w+)\s*(ASC|DESC)?", RegexOptions.IgnoreCase);
        if (orderByMatch.Success)
        {
            var col = orderByMatch.Groups[1].Value;
            var desc = orderByMatch.Groups[2].Success &&
                       orderByMatch.Groups[2].Value.Equals("DESC", StringComparison.OrdinalIgnoreCase);

            results = results.OrderBy(row =>
            {
                if (!row.TryGetValue(col, out var v)) return (object)"";
                return double.TryParse(v, out var n) ? (object)n : v;
            }).ToList();

            if (desc)
                results.Reverse();
        }

        // ── parse TOP N ─────────────────────────────────────────────────
        var topMatch = Regex.Match(sql, @"SELECT\s+TOP\s+(\d+)", RegexOptions.IgnoreCase);
        if (topMatch.Success && int.TryParse(topMatch.Groups[1].Value, out var limit))
        {
            results = results.Take(limit).ToList();
        }

        return results;
    }

    // ── 3. GenerateExplanation ──────────────────────────────────────────
    public string GenerateExplanation(string value, string columnLabel, string lang)
    {
        var isMalay = lang.StartsWith("ms", StringComparison.OrdinalIgnoreCase)
                   || lang.StartsWith("bm", StringComparison.OrdinalIgnoreCase);
        var v = value.Trim();

        // ── academic grades ─────────────────────────────────────────────
        var grades = new Dictionary<string, (string en, string ms)>(StringComparer.OrdinalIgnoreCase)
        {
            ["DM"]  = ("DM (Jawatan Utama) - Top management grade in the Malaysian public service.",
                       "DM (Jawatan Utama) - Gred pengurusan tertinggi dalam perkhidmatan awam Malaysia."),
            ["DS"]  = ("DS (Pengurusan dan Profesional) - Management and professional grade.",
                       "DS (Pengurusan dan Profesional) - Gred pengurusan dan profesional."),
            ["DU"]  = ("DU (Pendidikan) - Education service grade for academic staff.",
                       "DU (Pendidikan) - Gred perkhidmatan pendidikan untuk staf akademik."),
            ["VK"]  = ("VK (Kejuruteraan) - Engineering service grade.",
                       "VK (Kejuruteraan) - Gred perkhidmatan kejuruteraan."),
        };

        var gradeKey = Regex.Match(v, @"^(DM|DS|DU|VK)", RegexOptions.IgnoreCase);
        if (gradeKey.Success && grades.TryGetValue(gradeKey.Value.ToUpper(), out var gExpl))
            return isMalay ? gExpl.ms : gExpl.en;

        // ── status values ───────────────────────────────────────────────
        var statuses = new Dictionary<string, (string en, string ms)>(StringComparer.OrdinalIgnoreCase)
        {
            ["Aktif"]    = ("Active - Currently in service / enrolled.",
                            "Aktif - Sedang dalam perkhidmatan / pendaftaran."),
            ["Active"]   = ("Active - Currently in service / enrolled.",
                            "Aktif - Sedang dalam perkhidmatan / pendaftaran."),
            ["Tamat"]    = ("Ended / Completed - No longer active.",
                            "Tamat - Tidak lagi aktif."),
            ["Ended"]    = ("Ended / Completed - No longer active.",
                            "Tamat - Tidak lagi aktif."),
            ["Completed"]= ("Completed - Successfully finished.",
                            "Selesai - Berjaya ditamatkan."),
            ["Pending"]  = ("Pending - Awaiting processing or approval.",
                            "Dalam proses - Menunggu pemprosesan atau kelulusan."),
            ["Approved"] = ("Approved - Has been approved.",
                            "Diluluskan - Telah diluluskan."),
            ["Granted"]  = ("Granted - Rights have been granted.",
                            "Diberikan - Hak telah diberikan."),
            ["Filed"]    = ("Filed - Application has been submitted.",
                            "Difailkan - Permohonan telah dikemukakan."),
        };

        if (statuses.TryGetValue(v, out var sExpl))
            return isMalay ? sExpl.ms : sExpl.en;

        // ── IP types ────────────────────────────────────────────────────
        var ipTypes = new Dictionary<string, (string en, string ms)>(StringComparer.OrdinalIgnoreCase)
        {
            ["Patent"]    = ("Patent - Exclusive rights for an invention.",
                             "Paten - Hak eksklusif untuk sesuatu ciptaan."),
            ["Trademark"] = ("Trademark - A recognizable sign identifying products or services.",
                             "Cap Dagangan - Tanda yang boleh dikenali bagi mengenal pasti produk atau perkhidmatan."),
            ["Copyright"] = ("Copyright - Legal right protecting original creative works.",
                             "Hak Cipta - Hak undang-undang yang melindungi karya kreatif asli."),
            ["Industrial Design"] = ("Industrial Design - Protection for the visual design of objects.",
                                     "Reka Bentuk Perindustrian - Perlindungan untuk reka bentuk visual objek."),
            ["Utility Innovation"] = ("Utility Innovation - A minor patent for incremental improvements.",
                                      "Inovasi Utiliti - Paten kecil untuk penambahbaikan bertahap."),
        };

        if (ipTypes.TryGetValue(v, out var ipExpl))
            return isMalay ? ipExpl.ms : ipExpl.en;

        // ── PTJ codes ───────────────────────────────────────────────────
        if (Regex.IsMatch(v, @"^[A-Z]{1,5}\d{0,3}$") &&
            (columnLabel.Contains("ptj", StringComparison.OrdinalIgnoreCase) || columnLabel.Contains("code", StringComparison.OrdinalIgnoreCase)))
        {
            return isMalay
                ? $"'{v}' ialah kod Pusat Tanggungjawab (PTJ) yang merujuk kepada unit organisasi dalam universiti."
                : $"'{v}' is a Responsibility Centre (PTJ) code referring to an organisational unit within the university.";
        }

        // ── dates ───────────────────────────────────────────────────────
        if (DateTime.TryParse(v, out var dt))
        {
            return isMalay
                ? $"Tarikh: {dt:dd MMMM yyyy} ({(DateTime.Today - dt).Days} hari yang lalu)."
                : $"Date: {dt:dd MMMM yyyy} ({(DateTime.Today - dt).Days} days ago).";
        }

        // ── emails ──────────────────────────────────────────────────────
        if (Regex.IsMatch(v, @"^[\w.-]+@[\w.-]+\.\w+$"))
        {
            return isMalay
                ? $"Alamat e-mel: {v}"
                : $"Email address: {v}";
        }

        // ── numeric ─────────────────────────────────────────────────────
        if (double.TryParse(v, out var numVal))
        {
            return isMalay
                ? $"Nilai numerik: {numVal:N2}"
                : $"Numeric value: {numVal:N2}";
        }

        // ── fallback ────────────────────────────────────────────────────
        return isMalay
            ? $"Nilai: {v}"
            : $"Value: {v}";
    }

    // ── 4. GetSampleQueries ─────────────────────────────────────────────
    public List<string> GetSampleQueries(string sourceId, string lang)
    {
        var isMalay = lang.StartsWith("ms", StringComparison.OrdinalIgnoreCase)
                   || lang.StartsWith("bm", StringComparison.OrdinalIgnoreCase);

        var samples = new Dictionary<string, List<(string en, string ms)>>
        {
            ["pensyarah"] = new()
            {
                ("Show all DM grade lecturers",                  "Papar semua pensyarah gred DM"),
                ("Count lecturers by faculty",                   "Kira bilangan pensyarah mengikut fakulti"),
                ("Find lecturers with H-Index above 10",         "Cari pensyarah dengan H-Index melebihi 10"),
            },
            ["pascasiswazah"] = new()
            {
                ("Show all active postgraduate students",        "Papar semua pelajar pascasiswazah aktif"),
                ("Count students by faculty",                    "Kira bilangan pelajar mengikut fakulti"),
                ("Find students with CGPA above 3.5",            "Cari pelajar dengan CGPA melebihi 3.5"),
            },
            ["penyelidikan"] = new()
            {
                ("Show all approved research databases",         "Papar semua pangkalan data penyelidikan yang diluluskan"),
                ("Count databases by faculty",                   "Kira bilangan pangkalan data mengikut fakulti"),
                ("Find databases with public access level",      "Cari pangkalan data dengan tahap akses awam"),
            },
            ["harta-intelek"] = new()
            {
                ("Show all granted patents",                     "Papar semua paten yang diberikan"),
                ("Top 5 patents by income",                      "5 paten teratas mengikut pendapatan"),
                ("Count intellectual properties by type",        "Kira bilangan harta intelek mengikut jenis"),
            },
            ["penyeliaan"] = new()
            {
                ("Show all active supervisions",                 "Papar semua penyeliaan aktif"),
                ("Count supervisions by faculty",                "Kira bilangan penyeliaan mengikut fakulti"),
                ("Find supervisions with viva result Pass",      "Cari penyeliaan dengan keputusan viva Lulus"),
            },
        };

        if (!samples.TryGetValue(sourceId, out var list))
        {
            return isMalay
                ? new List<string> { "Papar semua rekod", "Kira rekod mengikut status", "Cari rekod aktif" }
                : new List<string> { "Show all records", "Count records by status", "Find active records" };
        }

        return list.Select(s => isMalay ? s.ms : s.en).ToList();
    }

    // ── Private helpers ─────────────────────────────────────────────────

    private static string NormalizeTable(string sourceId)
    {
        return sourceId.Replace("-", "_");
    }

    private static string ResolveColumn(string hint, List<ColumnDef> columns)
    {
        var lower = hint.ToLower().Trim();

        // Direct key match
        var exact = columns.FirstOrDefault(c => c.Key.Equals(hint, StringComparison.OrdinalIgnoreCase));
        if (exact != null) return exact.Key;

        // Partial match on key
        var partial = columns.FirstOrDefault(c => c.Key.ToLower().Contains(lower));
        if (partial != null) return partial.Key;

        // Common aliases
        var aliases = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["faculty"]    = "Faculty",
            ["fakulti"]    = "User_Fakulti",
            ["grade"]      = "User_Gred",
            ["gred"]       = "User_Gred",
            ["status"]     = "Status",
            ["name"]       = "Name",
            ["income"]     = "LicenseIncome",
            ["pendapatan"] = "LicenseIncome",
            ["type"]       = "Type",
            ["jenis"]      = "Type",
            ["programme"]  = "Programme",
            ["program"]    = "Programme",
            ["hindex"]     = "User_HIndex",
            ["h-index"]    = "User_HIndex",
            ["cgpa"]       = "CGPA",
            ["salary"]     = "User_Gaji",
            ["gaji"]       = "User_Gaji",
            ["department"] = "Department",
            ["jabatan"]    = "User_Jabatan",
            ["country"]    = "Country",
            ["negara"]     = "Country",
            ["role"]       = "Role",
            ["peranan"]    = "Role",
        };

        if (aliases.TryGetValue(lower, out var mapped))
        {
            var found = columns.FirstOrDefault(c => c.Key.Equals(mapped, StringComparison.OrdinalIgnoreCase));
            if (found != null) return found.Key;
            return mapped;
        }

        // Fallback: return hint capitalised
        return char.ToUpper(hint[0]) + hint[1..];
    }

    private static (string col, string val)? TryExtractEqualsFilter(string lower, List<ColumnDef> columns)
    {
        // ── status patterns ─────────────────────────────────────────
        if (Regex.IsMatch(lower, @"\b(active|aktif)\b"))
        {
            var col = columns.Any(c => c.Key == "User_Status") ? "User_Status" : "Status";
            var val = columns.Any(c => c.Key == "User_Status") ? "Aktif" : "Active";
            return (col, val);
        }

        if (Regex.IsMatch(lower, @"\b(ended|tamat)\b"))
        {
            var col = columns.Any(c => c.Key == "User_Status") ? "User_Status" : "Status";
            var val = columns.Any(c => c.Key == "User_Status") ? "Tamat" : "Ended";
            return (col, val);
        }

        if (Regex.IsMatch(lower, @"\b(completed|selesai)\b"))
        {
            var col = columns.Any(c => c.Key == "User_Status") ? "User_Status" : "Status";
            return (col, "Completed");
        }

        if (Regex.IsMatch(lower, @"\b(pending|menunggu)\b"))
        {
            var col = columns.Any(c => c.Key == "User_Status") ? "User_Status" : "Status";
            return (col, "Pending");
        }

        if (Regex.IsMatch(lower, @"\b(approved|diluluskan)\b"))
        {
            var col = columns.Any(c => c.Key == "User_Status") ? "User_Status" : "Status";
            return (col, "Approved");
        }

        if (Regex.IsMatch(lower, @"\b(granted|diberikan)\b"))
        {
            var col = columns.Any(c => c.Key == "User_Status") ? "User_Status" : "Status";
            return (col, "Granted");
        }

        if (Regex.IsMatch(lower, @"\b(filed|difailkan)\b"))
        {
            var col = columns.Any(c => c.Key == "User_Status") ? "User_Status" : "Status";
            return (col, "Filed");
        }

        // ── grade patterns (DM, DS, DU, VK) ────────────────────────
        var gradeMatch = Regex.Match(lower, @"\b(dm|ds|du|vk)\d*\b");
        if (gradeMatch.Success && columns.Any(c => c.Key == "User_Gred"))
        {
            return ("User_Gred", gradeMatch.Value.ToUpper());
        }

        // ── IP type patterns ────────────────────────────────────────
        if (Regex.IsMatch(lower, @"\bpatent\b") && columns.Any(c => c.Key == "Type"))
            return ("Type", "Patent");
        if (Regex.IsMatch(lower, @"\btrademark\b") && columns.Any(c => c.Key == "Type"))
            return ("Type", "Trademark");
        if (Regex.IsMatch(lower, @"\bcopyright\b") && columns.Any(c => c.Key == "Type"))
            return ("Type", "Copyright");

        // ── generic "column = value" pattern ────────────────────────
        var genericMatch = Regex.Match(lower, @"(?:where|with)\s+(\w+)\s*=\s*'?(\w+)'?");
        if (genericMatch.Success)
        {
            var col = ResolveColumn(genericMatch.Groups[1].Value, columns);
            return (col, genericMatch.Groups[2].Value);
        }

        return null;
    }
}
