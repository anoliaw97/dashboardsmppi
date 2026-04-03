namespace DashboardSMPPI.Models;

public class DashboardViewModel
{
    public List<DataSourceConfig> DataSources { get; set; } = new();
    public string Lang { get; set; } = "en";
}

public class QueryRequest
{
    public string Prompt { get; set; } = "";
    public string SourceId { get; set; } = "";
    public string Lang { get; set; } = "en";
}

public class QueryResponse
{
    public string Sql { get; set; } = "";
    public string Explanation { get; set; } = "";
    public List<Dictionary<string, string>> Results { get; set; } = new();
}

public class ExplainRequest
{
    public string Value { get; set; } = "";
    public string ColumnLabel { get; set; } = "";
    public string Lang { get; set; } = "en";
}

public class ExplainResponse
{
    public string Explanation { get; set; } = "";
}

public class DataRequest
{
    public string SourceId { get; set; } = "";
    public string Search { get; set; } = "";
    public Dictionary<string, string>? ColumnFilters { get; set; }
    public string? SortKey { get; set; }
    public string SortDir { get; set; } = "asc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class DataResponse
{
    public List<Dictionary<string, string>> Rows { get; set; } = new();
    public int TotalCount { get; set; }
    public int FilteredCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class JoinRequest
{
    public List<string> SourceIds { get; set; } = new();
    public string JoinColumn { get; set; } = "";
    public string JoinType { get; set; } = "inner";
}

public class JoinResponse
{
    public List<string> Columns { get; set; } = new();
    public List<Dictionary<string, string>> Rows { get; set; } = new();
}
