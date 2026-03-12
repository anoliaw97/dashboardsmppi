using Microsoft.AspNetCore.Mvc;
using SmppiDashboard.Models;
using SmppiDashboard.Services;

namespace SmppiDashboard.Controllers;

/// <summary>
/// API controller for the Join Builder feature.
/// Supports multi-table joins, save/load/delete from server session,
/// and Excel export of joined results.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class JoinController : ControllerBase
{
    private readonly IDatabaseService _db;
    private readonly IExcelExportService _excel;
    private const string SessionKey = "SavedJoins";

    public JoinController(IDatabaseService db, IExcelExportService excel)
    {
        _db = db;
        _excel = excel;
    }

    /// <summary>POST api/join/preview – perform join and return preview rows</summary>
    [HttpPost("preview")]
    public async Task<IActionResult> Preview([FromBody] JoinRequest request)
    {
        if (request.SourceIds.Count < 2)
            return BadRequest("At least 2 sources required");

        if (string.IsNullOrWhiteSpace(request.JoinColumn))
            return BadRequest("joinColumn is required");

        var result = await _db.PerformJoinAsync(request);
        return Ok(result);
    }

    /// <summary>POST api/join/save – perform join and save definition to session</summary>
    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] JoinRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SaveName))
            return BadRequest("saveName is required");

        // Validate join works
        var result = await _db.PerformJoinAsync(request);

        var saved = new SavedJoin
        {
            Id = Guid.NewGuid().ToString("N")[..8],
            Name = request.SaveName,
            SourceIds = request.SourceIds,
            JoinColumn = request.JoinColumn,
            JoinType = request.JoinType,
            CreatedAt = DateTime.UtcNow
        };

        var list = HttpContext.Session.GetObjectFromJson<List<SavedJoin>>(SessionKey)
            ?? new List<SavedJoin>();
        list.Insert(0, saved);
        HttpContext.Session.SetObjectAsJson(SessionKey, list);

        return Ok(new { id = saved.Id, rowCount = result.RowCount });
    }

    /// <summary>GET api/join/list – list saved joins from session</summary>
    [HttpGet("list")]
    public IActionResult List()
    {
        var list = HttpContext.Session.GetObjectFromJson<List<SavedJoin>>(SessionKey)
            ?? new List<SavedJoin>();
        return Ok(list);
    }

    /// <summary>POST api/join/load/{id} – re-execute a saved join and return its data</summary>
    [HttpPost("load/{id}")]
    public async Task<IActionResult> Load(string id, [FromQuery] string lang = "en")
    {
        var list = HttpContext.Session.GetObjectFromJson<List<SavedJoin>>(SessionKey)
            ?? new List<SavedJoin>();

        var saved = list.FirstOrDefault(j => j.Id == id);
        if (saved == null)
            return NotFound("Saved join not found");

        var request = new JoinRequest
        {
            SourceIds = saved.SourceIds,
            JoinColumn = saved.JoinColumn,
            JoinType = saved.JoinType,
            Lang = lang
        };

        var result = await _db.PerformJoinAsync(request);
        return Ok(result);
    }

    /// <summary>DELETE api/join/{id} – remove a saved join</summary>
    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var list = HttpContext.Session.GetObjectFromJson<List<SavedJoin>>(SessionKey)
            ?? new List<SavedJoin>();

        var before = list.Count;
        list.RemoveAll(j => j.Id == id);

        if (list.Count == before)
            return NotFound("Saved join not found");

        HttpContext.Session.SetObjectAsJson(SessionKey, list);
        return Ok(new { deleted = true });
    }

    /// <summary>POST api/join/export – export join result to Excel</summary>
    [HttpPost("export")]
    public async Task<IActionResult> Export([FromBody] JoinRequest request)
    {
        var result = await _db.PerformJoinAsync(request);

        var bytes = _excel.ExportToExcel(result.Rows, result.Columns, result.Label);
        return File(bytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"SMPPI_Join_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
    }

    /// <summary>GET api/join/common-columns?sources=pensyarah&sources=penyeliaan – find common joinable columns</summary>
    [HttpGet("common-columns")]
    public async Task<IActionResult> CommonColumns(
        [FromQuery] List<string> sources,
        [FromQuery] string lang = "en")
    {
        if (sources.Count < 2)
            return BadRequest("At least 2 sources required");

        var allSources = await _db.GetDataSourcesAsync(lang);
        var matchedSources = sources
            .Select(id => allSources.FirstOrDefault(s => s.Id == id))
            .Where(s => s != null)
            .ToList();

        if (matchedSources.Count < 2)
            return BadRequest("Could not find all specified sources");

        // Find columns that appear in ALL selected sources
        var commonKeys = matchedSources[0]!.Columns.Select(c => c.Key).ToHashSet();
        foreach (var src in matchedSources.Skip(1))
            commonKeys.IntersectWith(src!.Columns.Select(c => c.Key));

        return Ok(commonKeys.ToList());
    }
}
