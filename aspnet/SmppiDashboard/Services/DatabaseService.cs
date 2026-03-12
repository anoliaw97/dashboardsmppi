using Microsoft.EntityFrameworkCore;
using SmppiDashboard.Data;
using SmppiDashboard.Models;

namespace SmppiDashboard.Services;

public interface IDatabaseService
{
    Task<List<DataSourceInfo>> GetDataSourcesAsync(string lang);
    Task<DataQueryResult> QueryAsync(DataQueryRequest request);
    Task<List<Dictionary<string, object?>>> GetAllRowsAsync(string sourceId, string lang);
    Task<List<string>> GetColumnValuesAsync(string sourceId, string columnKey);
    Task<JoinResult> PerformJoinAsync(JoinRequest request);
}

public class DatabaseService : IDatabaseService
{
    private readonly SmppiDbContext _db;
    private readonly ILogger<DatabaseService> _logger;

    public DatabaseService(SmppiDbContext db, ILogger<DatabaseService> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ─── Data Source Metadata ───────────────────────────────────────────────

    public Task<List<DataSourceInfo>> GetDataSourcesAsync(string lang)
    {
        bool ms = lang == "ms";

        var sources = new List<DataSourceInfo>
        {
            new()
            {
                Id = "pensyarah",
                Label = ms ? "Pensyarah" : "Academic Staff",
                Description = ms
                    ? "Maklumat pensyarah dan kakitangan akademik"
                    : "Lecturer and academic staff information",
                Columns = new()
                {
                    new() { Key = "NoStaf",      Label = ms ? "No Staf"     : "Staff No",    DataType = "string" },
                    new() { Key = "Nama",         Label = ms ? "Nama"        : "Name",        DataType = "string" },
                    new() { Key = "Jawatan",      Label = ms ? "Jawatan"     : "Position",    DataType = "string" },
                    new() { Key = "Ptj",          Label = ms ? "PTJ"         : "Department",  DataType = "string" },
                    new() { Key = "GredJawatan",  Label = ms ? "Gred"        : "Grade",       DataType = "string" },
                    new() { Key = "Status",       Label = ms ? "Status"      : "Status",      DataType = "string" },
                    new() { Key = "Email",        Label = ms ? "E-mel"       : "Email",       DataType = "string" },
                    new() { Key = "NoTelefon",    Label = ms ? "No Telefon"  : "Phone",       DataType = "string" },
                }
            },
            new()
            {
                Id = "pascasiswazah",
                Label = ms ? "Pascasiswazah" : "Postgraduate",
                Description = ms
                    ? "Data pelajar pascasiswazah (Masters & PhD)"
                    : "Postgraduate student data (Masters & PhD)",
                Columns = new()
                {
                    new() { Key = "NoMatrik",       Label = ms ? "No Matrik"          : "Matric No",    DataType = "string" },
                    new() { Key = "Nama",            Label = ms ? "Nama"               : "Name",         DataType = "string" },
                    new() { Key = "Program",         Label = ms ? "Program"            : "Program",      DataType = "string" },
                    new() { Key = "Mod",             Label = ms ? "Mod Pengajian"      : "Study Mode",   DataType = "string" },
                    new() { Key = "Sesi",            Label = ms ? "Sesi"               : "Session",      DataType = "string" },
                    new() { Key = "StatusPengajian", Label = ms ? "Status Pengajian"   : "Study Status", DataType = "string" },
                    new() { Key = "NoPenyelia",      Label = ms ? "No Penyelia"        : "Supervisor No",DataType = "string" },
                }
            },
            new()
            {
                Id = "penyelidikan",
                Label = ms ? "Penyelidikan" : "Research",
                Description = ms
                    ? "Projek penyelidikan dan geran"
                    : "Research projects and grants",
                Columns = new()
                {
                    new() { Key = "KodProjek",           Label = ms ? "Kod Projek"       : "Project Code",     DataType = "string"  },
                    new() { Key = "TajukProjek",         Label = ms ? "Tajuk Projek"     : "Project Title",    DataType = "string"  },
                    new() { Key = "NoPenyelidikUtama",   Label = ms ? "No Penyelidik"    : "Researcher No",    DataType = "string"  },
                    new() { Key = "SumberTunai",         Label = ms ? "Sumber Tunai"     : "Funding Source",   DataType = "string"  },
                    new() { Key = "JumlahGeran",         Label = ms ? "Jumlah Geran"     : "Grant Amount",     DataType = "decimal" },
                    new() { Key = "StatusProjek",        Label = ms ? "Status"           : "Status",           DataType = "string"  },
                    new() { Key = "TarikhMula",          Label = ms ? "Tarikh Mula"      : "Start Date",       DataType = "date"    },
                    new() { Key = "TarikhTamat",         Label = ms ? "Tarikh Tamat"     : "End Date",         DataType = "date"    },
                }
            },
            new()
            {
                Id = "harta-intelek",
                Label = ms ? "Harta Intelek" : "Intellectual Property",
                Description = ms
                    ? "Rekod harta intelek dan paten"
                    : "Intellectual property and patent records",
                Columns = new()
                {
                    new() { Key = "NoHartaIntelek",     Label = ms ? "No HI"             : "IP No",            DataType = "string" },
                    new() { Key = "Tajuk",               Label = ms ? "Tajuk"             : "Title",            DataType = "string" },
                    new() { Key = "NoPemohon",           Label = ms ? "No Pemohon"        : "Applicant No",     DataType = "string" },
                    new() { Key = "JenisHartaIntelek",  Label = ms ? "Jenis HI"          : "IP Type",          DataType = "string" },
                    new() { Key = "NoPendaftaran",       Label = ms ? "No Pendaftaran"    : "Registration No",  DataType = "string" },
                    new() { Key = "StatusPermohonan",    Label = ms ? "Status"            : "Status",           DataType = "string" },
                    new() { Key = "TarikhFail",          Label = ms ? "Tarikh Fail"       : "Filing Date",      DataType = "date"   },
                    new() { Key = "TarikhGranted",       Label = ms ? "Tarikh Granted"    : "Granted Date",     DataType = "date"   },
                }
            },
            new()
            {
                Id = "penyeliaan",
                Label = ms ? "Penyeliaan" : "Supervision",
                Description = ms
                    ? "Rekod penyeliaan pelajar pascasiswazah"
                    : "Postgraduate student supervision records",
                Columns = new()
                {
                    new() { Key = "NoPenyelia",       Label = ms ? "No Penyelia"      : "Supervisor No",   DataType = "string" },
                    new() { Key = "NoMatrik",          Label = ms ? "No Matrik"        : "Student No",      DataType = "string" },
                    new() { Key = "PerananPenyelia",  Label = ms ? "Peranan"          : "Role",            DataType = "string" },
                    new() { Key = "Sesi",              Label = ms ? "Sesi"             : "Session",         DataType = "string" },
                    new() { Key = "StatusPenyeliaan", Label = ms ? "Status"           : "Status",          DataType = "string" },
                }
            }
        };

        // Populate record counts from DB
        foreach (var src in sources)
        {
            src.RecordCount = src.Id switch
            {
                "pensyarah"      => _db.Pensyarah.Count(),
                "pascasiswazah"  => _db.Pascasiswazah.Count(),
                "penyelidikan"   => _db.Penyelidikan.Count(),
                "harta-intelek"  => _db.HartaIntelek.Count(),
                "penyeliaan"     => _db.Penyeliaan.Count(),
                _ => 0
            };
        }

        return Task.FromResult(sources);
    }

    // ─── Dynamic Query with Filtering, Sorting, Pagination ──────────────────

    public async Task<DataQueryResult> QueryAsync(DataQueryRequest request)
    {
        var rows = await GetRawRowsAsync(request.SourceId, request.Lang);

        // Global search
        if (!string.IsNullOrWhiteSpace(request.GlobalSearch))
        {
            var lower = request.GlobalSearch.ToLower();
            rows = rows.Where(r => r.Values.Any(v =>
                v?.ToString()?.ToLower().Contains(lower) == true)).ToList();
        }

        // Per-column filters
        foreach (var (key, value) in request.ColumnFilters)
        {
            if (string.IsNullOrWhiteSpace(value)) continue;
            var lower = value.ToLower();
            rows = rows.Where(r =>
                r.TryGetValue(key, out var v) &&
                v?.ToString()?.ToLower().Contains(lower) == true).ToList();
        }

        var totalFiltered = rows.Count;

        // Sort
        if (!string.IsNullOrWhiteSpace(request.SortKey))
        {
            rows = request.SortDirection == "desc"
                ? rows.OrderByDescending(r => r.GetValueOrDefault(request.SortKey)?.ToString()).ToList()
                : rows.OrderBy(r => r.GetValueOrDefault(request.SortKey)?.ToString()).ToList();
        }

        // Paginate
        var pagedRows = rows
            .Skip(request.Page * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new DataQueryResult
        {
            Rows = pagedRows,
            TotalCount = await GetTotalCountAsync(request.SourceId),
            FilteredCount = totalFiltered,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling(totalFiltered / (double)request.PageSize)
        };
    }

    public async Task<List<Dictionary<string, object?>>> GetAllRowsAsync(string sourceId, string lang)
        => await GetRawRowsAsync(sourceId, lang);

    private async Task<int> GetTotalCountAsync(string sourceId) => sourceId switch
    {
        "pensyarah"     => await _db.Pensyarah.CountAsync(),
        "pascasiswazah" => await _db.Pascasiswazah.CountAsync(),
        "penyelidikan"  => await _db.Penyelidikan.CountAsync(),
        "harta-intelek" => await _db.HartaIntelek.CountAsync(),
        "penyeliaan"    => await _db.Penyeliaan.CountAsync(),
        _ => 0
    };

    private async Task<List<Dictionary<string, object?>>> GetRawRowsAsync(string sourceId, string lang)
    {
        return sourceId switch
        {
            "pensyarah" => (await _db.Pensyarah.AsNoTracking().ToListAsync())
                .Select(p => new Dictionary<string, object?>
                {
                    ["NoStaf"]     = p.NoStaf,
                    ["Nama"]       = p.Nama,
                    ["Jawatan"]    = p.Jawatan,
                    ["Ptj"]        = p.Ptj,
                    ["GredJawatan"] = p.GredJawatan,
                    ["Status"]     = p.Status,
                    ["Email"]      = p.Email,
                    ["NoTelefon"]  = p.NoTelefon,
                }).ToList(),

            "pascasiswazah" => (await _db.Pascasiswazah.AsNoTracking().ToListAsync())
                .Select(p => new Dictionary<string, object?>
                {
                    ["NoMatrik"]        = p.NoMatrik,
                    ["Nama"]            = p.Nama,
                    ["Program"]         = p.Program,
                    ["Mod"]             = p.Mod,
                    ["Sesi"]            = p.Sesi,
                    ["StatusPengajian"] = p.StatusPengajian,
                    ["NoPenyelia"]      = p.NoPenyelia,
                }).ToList(),

            "penyelidikan" => (await _db.Penyelidikan.AsNoTracking().ToListAsync())
                .Select(p => new Dictionary<string, object?>
                {
                    ["KodProjek"]          = p.KodProjek,
                    ["TajukProjek"]        = p.TajukProjek,
                    ["NoPenyelidikUtama"]  = p.NoPenyelidikUtama,
                    ["SumberTunai"]        = p.SumberTunai,
                    ["JumlahGeran"]        = p.JumlahGeran,
                    ["StatusProjek"]       = p.StatusProjek,
                    ["TarikhMula"]         = p.TarikhMula?.ToString("yyyy-MM-dd"),
                    ["TarikhTamat"]        = p.TarikhTamat?.ToString("yyyy-MM-dd"),
                }).ToList(),

            "harta-intelek" => (await _db.HartaIntelek.AsNoTracking().ToListAsync())
                .Select(h => new Dictionary<string, object?>
                {
                    ["NoHartaIntelek"]    = h.NoHartaIntelek,
                    ["Tajuk"]             = h.Tajuk,
                    ["NoPemohon"]         = h.NoPemohon,
                    ["JenisHartaIntelek"] = h.JenisHartaIntelek,
                    ["NoPendaftaran"]     = h.NoPendaftaran,
                    ["StatusPermohonan"]  = h.StatusPermohonan,
                    ["TarikhFail"]        = h.TarikhFail?.ToString("yyyy-MM-dd"),
                    ["TarikhGranted"]     = h.TarikhGranted?.ToString("yyyy-MM-dd"),
                }).ToList(),

            "penyeliaan" => (await _db.Penyeliaan.AsNoTracking().ToListAsync())
                .Select(p => new Dictionary<string, object?>
                {
                    ["NoPenyelia"]       = p.NoPenyelia,
                    ["NoMatrik"]         = p.NoMatrik,
                    ["PerananPenyelia"]  = p.PerananPenyelia,
                    ["Sesi"]             = p.Sesi,
                    ["StatusPenyeliaan"] = p.StatusPenyeliaan,
                }).ToList(),

            _ => new()
        };
    }

    public async Task<List<string>> GetColumnValuesAsync(string sourceId, string columnKey)
    {
        var rows = await GetRawRowsAsync(sourceId, "en");
        return rows
            .Select(r => r.GetValueOrDefault(columnKey)?.ToString() ?? "")
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .Distinct()
            .OrderBy(v => v)
            .ToList();
    }

    // ─── Join Builder ─────────────────────────────────────────────────────────

    public async Task<JoinResult> PerformJoinAsync(JoinRequest request)
    {
        if (request.SourceIds.Count < 2)
            return new JoinResult { Label = "Invalid join: need at least 2 sources" };

        var allSources = await GetDataSourcesAsync(request.Lang);
        var firstSrc = allSources.First(s => s.Id == request.SourceIds[0]);
        var firstData = await GetRawRowsAsync(request.SourceIds[0], request.Lang);

        var resultRows = firstData;
        var resultColumns = new List<ColumnInfo>(firstSrc.Columns);

        foreach (var srcId in request.SourceIds.Skip(1))
        {
            var rightSrc = allSources.FirstOrDefault(s => s.Id == srcId);
            if (rightSrc == null) continue;

            var rightData = await GetRawRowsAsync(srcId, request.Lang);

            // Add right-side columns (excluding join key to avoid duplicate)
            var rightCols = rightSrc.Columns
                .Where(c => c.Key != request.JoinColumn)
                .Select(c => new ColumnInfo { Key = $"{srcId}_{c.Key}", Label = $"{rightSrc.Label}: {c.Label}", DataType = c.DataType })
                .ToList();
            resultColumns.AddRange(rightCols);

            // Build lookup from right side keyed by join column
            var rightLookup = rightData
                .GroupBy(r => r.GetValueOrDefault(request.JoinColumn)?.ToString() ?? "")
                .ToDictionary(g => g.Key, g => g.ToList());

            var joinedRows = new List<Dictionary<string, object?>>();

            foreach (var leftRow in resultRows)
            {
                var keyVal = leftRow.GetValueOrDefault(request.JoinColumn)?.ToString() ?? "";
                bool hasMatch = rightLookup.TryGetValue(keyVal, out var rightMatches) && rightMatches != null;

                if (request.JoinType == "inner" && !hasMatch) continue;

                var matchList = hasMatch ? rightMatches! : new List<Dictionary<string, object?>> { new() };

                foreach (var rightRow in matchList)
                {
                    var merged = new Dictionary<string, object?>(leftRow);
                    foreach (var col in rightCols)
                    {
                        // col.Key is "srcId_origKey"; get origKey
                        var origKey = col.Key[(srcId.Length + 1)..];
                        merged[col.Key] = rightRow.GetValueOrDefault(origKey);
                    }
                    joinedRows.Add(merged);
                }
            }

            // Full outer join: add right rows with no match
            if (request.JoinType == "full")
            {
                var matchedKeys = new HashSet<string>(
                    resultRows.Select(r => r.GetValueOrDefault(request.JoinColumn)?.ToString() ?? ""));

                foreach (var (key, rightRows2) in rightLookup)
                {
                    if (matchedKeys.Contains(key)) continue;
                    foreach (var rightRow in rightRows2)
                    {
                        var unmatched = new Dictionary<string, object?>();
                        foreach (var col in resultColumns)
                        {
                            var origKey = col.Key.Contains('_') ? col.Key[(col.Key.IndexOf('_') + 1)..] : col.Key;
                            unmatched[col.Key] = rightRow.GetValueOrDefault(origKey);
                        }
                        joinedRows.Add(unmatched);
                    }
                }
            }

            resultRows = joinedRows;
        }

        var sourceLabels = request.SourceIds
            .Select(id => allSources.FirstOrDefault(s => s.Id == id)?.Label ?? id)
            .ToList();

        return new JoinResult
        {
            Rows = resultRows,
            Columns = resultColumns,
            Label = string.Join(" + ", sourceLabels),
            RowCount = resultRows.Count
        };
    }
}
