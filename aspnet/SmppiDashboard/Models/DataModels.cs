using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmppiDashboard.Models;

// ─── Pensyarah (Academic Staff) ─────────────────────────────────────────────

[Table("Pensyarah", Schema = "dbo")]
public class Pensyarah
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string NoStaf { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Nama { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Jawatan { get; set; }

    [MaxLength(100)]
    public string? Ptj { get; set; }

    [MaxLength(20)]
    public string? GredJawatan { get; set; }

    [MaxLength(10)]
    public string? Status { get; set; }

    [MaxLength(200)]
    public string? Email { get; set; }

    [MaxLength(20)]
    public string? NoTelefon { get; set; }
}

// ─── Pascasiswazah (Postgraduate) ────────────────────────────────────────────

[Table("Pascasiswazah", Schema = "dbo")]
public class Pascasiswazah
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string NoMatrik { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Nama { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Program { get; set; }

    [MaxLength(10)]
    public string? Mod { get; set; }

    [MaxLength(20)]
    public string? Sesi { get; set; }

    [MaxLength(10)]
    public string? StatusPengajian { get; set; }

    [MaxLength(20)]
    public string? NoPenyelia { get; set; }
}

// ─── Penyelidikan (Research) ──────────────────────────────────────────────────

[Table("Penyelidikan", Schema = "dbo")]
public class Penyelidikan
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string KodProjek { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string TajukProjek { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? NoPenyelidikUtama { get; set; }

    [MaxLength(100)]
    public string? SumberTunai { get; set; }

    [Column(TypeName = "decimal(15,2)")]
    public decimal? JumlahGeran { get; set; }

    [MaxLength(10)]
    public string? StatusProjek { get; set; }

    public DateTime? TarikhMula { get; set; }
    public DateTime? TarikhTamat { get; set; }
}

// ─── Harta Intelek (Intellectual Property) ───────────────────────────────────

[Table("HartaIntelek", Schema = "dbo")]
public class HartaIntelek
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    public string NoHartaIntelek { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Tajuk { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? NoPemohon { get; set; }

    [MaxLength(30)]
    public string? JenisHartaIntelek { get; set; }

    [MaxLength(50)]
    public string? NoPendaftaran { get; set; }

    [MaxLength(15)]
    public string? StatusPermohonan { get; set; }

    public DateTime? TarikhFail { get; set; }
    public DateTime? TarikhGranted { get; set; }
}

// ─── Penyeliaan (Supervision) ─────────────────────────────────────────────────

[Table("Penyeliaan", Schema = "dbo")]
public class Penyeliaan
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(20)]
    public string NoPenyelia { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string NoMatrik { get; set; } = string.Empty;

    [MaxLength(15)]
    public string? PerananPenyelia { get; set; }

    [MaxLength(20)]
    public string? Sesi { get; set; }

    [MaxLength(15)]
    public string? StatusPenyeliaan { get; set; }
}

// ─── View Models ─────────────────────────────────────────────────────────────

public class DataSourceInfo
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<ColumnInfo> Columns { get; set; } = new();
    public int RecordCount { get; set; }
}

public class ColumnInfo
{
    public string Key { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string DataType { get; set; } = "string";
}

public class DataQueryRequest
{
    public string SourceId { get; set; } = string.Empty;
    public string? GlobalSearch { get; set; }
    public Dictionary<string, string> ColumnFilters { get; set; } = new();
    public string? SortKey { get; set; }
    public string SortDirection { get; set; } = "asc";
    public int Page { get; set; } = 0;
    public int PageSize { get; set; } = 10;
    public string Lang { get; set; } = "en";
}

public class DataQueryResult
{
    public List<Dictionary<string, object?>> Rows { get; set; } = new();
    public int TotalCount { get; set; }
    public int FilteredCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class AiQueryRequest
{
    public string SourceId { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public string Lang { get; set; } = "en";
}

public class AiQueryResult
{
    public string Sql { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
    public bool IsReadOnly { get; set; } = true;
}

public class JoinRequest
{
    public List<string> SourceIds { get; set; } = new();
    public string JoinColumn { get; set; } = string.Empty;
    public string JoinType { get; set; } = "inner";  // inner | left | full
    public string? SaveName { get; set; }
    public string Lang { get; set; } = "en";
}

public class JoinResult
{
    public List<Dictionary<string, object?>> Rows { get; set; } = new();
    public List<ColumnInfo> Columns { get; set; } = new();
    public string Label { get; set; } = string.Empty;
    public int RowCount { get; set; }
}

public class SavedJoin
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public string Name { get; set; } = string.Empty;
    public List<string> SourceIds { get; set; } = new();
    public string JoinColumn { get; set; } = string.Empty;
    public string JoinType { get; set; } = "inner";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ExplainRequest
{
    public string Value { get; set; } = string.Empty;
    public string ColumnLabel { get; set; } = string.Empty;
    public string Lang { get; set; } = "en";
}

public class DashboardViewModel
{
    public List<DataSourceInfo> DataSources { get; set; } = new();
    public string Lang { get; set; } = "en";
    public List<SavedJoin> SavedJoins { get; set; } = new();
}
