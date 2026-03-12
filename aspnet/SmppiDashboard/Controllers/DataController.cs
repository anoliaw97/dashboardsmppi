using Microsoft.AspNetCore.Mvc;
using SmppiDashboard.Models;
using SmppiDashboard.Services;

namespace SmppiDashboard.Controllers;

/// <summary>
/// REST API controller for data retrieval, filtering, sorting, and pagination.
/// All endpoints return JSON consumed by the client-side JavaScript dashboard.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class DataController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IAiQueryService _ai;
    private readonly IExcelExportService _excel;

    public DataController(
        IDatabaseService db,
        IAiQueryService ai,
        IExcelExportService excel)
    {
        _db = db;
        _ai = ai;
        _excel = excel;
    }

    // ─── Data Source Info ─────────────────────────────────────────────────────

    /// <summary>GET api/data/sources?lang=en – returns all data sources with metadata</summary>
    [HttpGet("sources")]
    public async Task<IActionResult> GetSources([FromQuery] string lang = "en")
    {
        var sources = await _db.GetDataSourcesAsync(lang);
        return Ok(sources);
    }

    /// <summary>GET api/data/column-values?sourceId=pensyarah&column=Status</summary>
    [HttpGet("column-values")]
    public async Task<IActionResult> GetColumnValues(
        [FromQuery] string sourceId,
        [FromQuery] string column)
    {
        var values = await _db.GetColumnValuesAsync(sourceId, column);
        return Ok(values);
    }

    // ─── Query ────────────────────────────────────────────────────────────────

    /// <summary>POST api/data/query – paginated, filtered, sorted data for the main table</summary>
    [HttpPost("query")]
    public async Task<IActionResult> Query([FromBody] DataQueryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SourceId))
            return BadRequest("sourceId is required");

        request.PageSize = Math.Clamp(request.PageSize, 5, 1000);
        var result = await _db.QueryAsync(request);
        return Ok(result);
    }

    // ─── AI Query Builder ─────────────────────────────────────────────────────

    /// <summary>POST api/data/ai-query – generate SQL from natural language</summary>
    [HttpPost("ai-query")]
    public async Task<IActionResult> AiQuery([FromBody] AiQueryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Prompt))
            return BadRequest("prompt is required");

        var sources = await _db.GetDataSourcesAsync(request.Lang);
        var source = sources.FirstOrDefault(s => s.Id == request.SourceId);
        if (source == null)
            return BadRequest("Unknown source");

        var result = _ai.GenerateSql(request, source);
        return Ok(result);
    }

    /// <summary>GET api/data/sample-queries?sourceId=pensyarah&lang=en</summary>
    [HttpGet("sample-queries")]
    public IActionResult GetSampleQueries([FromQuery] string sourceId, [FromQuery] string lang = "en")
    {
        var queries = _ai.GetSampleQueries(sourceId, lang);
        return Ok(queries);
    }

    /// <summary>POST api/data/explain – explain a cell value</summary>
    [HttpPost("explain")]
    public IActionResult Explain([FromBody] ExplainRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Value))
            return BadRequest("value is required");

        var explanation = _ai.GenerateExplanation(request);
        return Ok(new { explanation });
    }

    // ─── Export ───────────────────────────────────────────────────────────────

    /// <summary>POST api/data/export – export to Excel (.xlsx)</summary>
    [HttpPost("export")]
    public async Task<IActionResult> Export([FromBody] ExportRequest request)
    {
        var sources = await _db.GetDataSourcesAsync(request.Lang);
        var source = sources.FirstOrDefault(s => s.Id == request.SourceId);
        if (source == null)
            return BadRequest("Unknown source");

        List<Dictionary<string, object?>> rows;

        if (request.FilteredOnly && request.QueryRequest != null)
        {
            request.QueryRequest.PageSize = 100000; // max export
            request.QueryRequest.Page = 0;
            var queryResult = await _db.QueryAsync(request.QueryRequest);
            rows = queryResult.Rows;
        }
        else
        {
            rows = await _db.GetAllRowsAsync(request.SourceId, request.Lang);
        }

        var bytes = _excel.ExportToExcel(rows, source.Columns, source.Label);
        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"SMPPI_{request.SourceId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
    }
}

public class ExportRequest
{
    public string SourceId { get; set; } = string.Empty;
    public string Lang { get; set; } = "en";
    public bool FilteredOnly { get; set; }
    public DataQueryRequest? QueryRequest { get; set; }
}
