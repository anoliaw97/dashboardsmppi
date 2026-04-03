using DashboardSMPPI.Models;
using DashboardSMPPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DashboardSMPPI.Controllers;

[Route("api")]
[ApiController]
public class ApiController : ControllerBase
{
    private readonly MockDataService _mockData;
    private readonly AiHelperService _aiHelper;
    private readonly TranslationService _translation;
    private readonly ExcelExportService _excelExport;

    public ApiController(MockDataService mockData, AiHelperService aiHelper,
        TranslationService translation, ExcelExportService excelExport)
    {
        _mockData = mockData;
        _aiHelper = aiHelper;
        _translation = translation;
        _excelExport = excelExport;
    }

    [HttpPost("data")]
    public IActionResult GetData([FromBody] DataRequest request)
    {
        var allData = _mockData.GetData(request.SourceId);
        if (allData == null) return NotFound();

        var filtered = allData;

        // Global search
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            filtered = filtered.Where(row =>
                row.Values.Any(v => v.ToLower().Contains(search))
            ).ToList();
        }

        // Column filters
        if (request.ColumnFilters != null)
        {
            foreach (var cf in request.ColumnFilters)
            {
                if (string.IsNullOrWhiteSpace(cf.Value)) continue;
                var filterVal = cf.Value.ToLower();
                filtered = filtered.Where(row =>
                    row.ContainsKey(cf.Key) &&
                    row[cf.Key].ToLower().Contains(filterVal)
                ).ToList();
            }
        }

        var totalCount = allData.Count;
        var filteredCount = filtered.Count;

        // Sort
        if (!string.IsNullOrWhiteSpace(request.SortKey))
        {
            filtered = request.SortDir == "desc"
                ? filtered.OrderByDescending(r => r.GetValueOrDefault(request.SortKey, "")).ToList()
                : filtered.OrderBy(r => r.GetValueOrDefault(request.SortKey, "")).ToList();
        }

        // Pagination
        var totalPages = (int)Math.Ceiling((double)filteredCount / request.PageSize);
        var page = Math.Max(1, Math.Min(request.Page, totalPages));
        var rows = filtered.Skip((page - 1) * request.PageSize).Take(request.PageSize).ToList();

        return Ok(new DataResponse
        {
            Rows = rows,
            TotalCount = totalCount,
            FilteredCount = filteredCount,
            Page = page,
            PageSize = request.PageSize,
            TotalPages = totalPages
        });
    }

    [HttpGet("columns/{sourceId}")]
    public IActionResult GetColumns(string sourceId)
    {
        var sources = DataSourceDefinitions.GetAll();
        var source = sources.FirstOrDefault(s => s.Id == sourceId);
        if (source == null) return NotFound();
        return Ok(source.Columns);
    }

    [HttpGet("filter-values/{sourceId}/{column}")]
    public IActionResult GetFilterValues(string sourceId, string column)
    {
        var data = _mockData.GetData(sourceId);
        if (data == null) return NotFound();

        var values = data
            .Where(r => r.ContainsKey(column) && !string.IsNullOrEmpty(r[column]))
            .Select(r => r[column])
            .Distinct()
            .OrderBy(v => v)
            .ToList();

        return Ok(values);
    }

    [HttpPost("ai/query")]
    public IActionResult AiQuery([FromBody] QueryRequest request)
    {
        var (sql, explanation) = _aiHelper.GenerateSql(request.Prompt, request.SourceId);
        var results = _aiHelper.ExecuteMockQuery(sql, request.SourceId);

        return Ok(new QueryResponse
        {
            Sql = sql,
            Explanation = explanation,
            Results = results
        });
    }

    [HttpPost("ai/explain")]
    public IActionResult AiExplain([FromBody] ExplainRequest request)
    {
        var explanation = _aiHelper.GenerateExplanation(request.Value, request.ColumnLabel, request.Lang);
        return Ok(new ExplainResponse { Explanation = explanation });
    }

    [HttpGet("ai/samples/{sourceId}")]
    public IActionResult GetSampleQueries(string sourceId, [FromQuery] string lang = "en")
    {
        var samples = _aiHelper.GetSampleQueries(sourceId, lang);
        return Ok(samples);
    }

    [HttpPost("join")]
    public IActionResult JoinData([FromBody] JoinRequest request)
    {
        if (request.SourceIds.Count < 2) return BadRequest("Need at least 2 sources");

        var datasets = request.SourceIds.Select(id => _mockData.GetData(id)).ToList();
        if (datasets.Any(d => d == null)) return NotFound("Source not found");

        var joinCol = request.JoinColumn;
        var result = new List<Dictionary<string, string>>();
        var allColumns = new HashSet<string>();

        var leftData = datasets[0]!;
        foreach (var row in leftData) foreach (var k in row.Keys) allColumns.Add(k);

        for (int i = 1; i < datasets.Count; i++)
        {
            var rightData = datasets[i]!;
            var sourceId = request.SourceIds[i];
            foreach (var row in rightData)
                foreach (var k in row.Keys)
                    allColumns.Add(allColumns.Contains(k) && k != joinCol ? $"{k}_{sourceId}" : k);

            var joined = new List<Dictionary<string, string>>();

            if (request.JoinType == "inner" || request.JoinType == "left")
            {
                foreach (var leftRow in (result.Count > 0 ? result : leftData))
                {
                    var leftVal = leftRow.GetValueOrDefault(joinCol, "");
                    var matches = rightData.Where(r => r.GetValueOrDefault(joinCol, "") == leftVal).ToList();

                    if (matches.Any())
                    {
                        foreach (var rightRow in matches)
                        {
                            var merged = new Dictionary<string, string>(leftRow);
                            foreach (var kv in rightRow)
                            {
                                if (kv.Key == joinCol) continue;
                                var key = merged.ContainsKey(kv.Key) ? $"{kv.Key}_{sourceId}" : kv.Key;
                                merged[key] = kv.Value;
                            }
                            joined.Add(merged);
                        }
                    }
                    else if (request.JoinType == "left")
                    {
                        joined.Add(new Dictionary<string, string>(leftRow));
                    }
                }
            }
            else // full
            {
                var matchedRight = new HashSet<int>();
                foreach (var leftRow in (result.Count > 0 ? result : leftData))
                {
                    var leftVal = leftRow.GetValueOrDefault(joinCol, "");
                    var matches = rightData.Select((r, idx) => (r, idx))
                        .Where(x => x.r.GetValueOrDefault(joinCol, "") == leftVal).ToList();

                    if (matches.Any())
                    {
                        foreach (var (rightRow, idx) in matches)
                        {
                            matchedRight.Add(idx);
                            var merged = new Dictionary<string, string>(leftRow);
                            foreach (var kv in rightRow)
                            {
                                if (kv.Key == joinCol) continue;
                                var key = merged.ContainsKey(kv.Key) ? $"{kv.Key}_{sourceId}" : kv.Key;
                                merged[key] = kv.Value;
                            }
                            joined.Add(merged);
                        }
                    }
                    else
                    {
                        joined.Add(new Dictionary<string, string>(leftRow));
                    }
                }
                for (int j = 0; j < rightData.Count; j++)
                {
                    if (!matchedRight.Contains(j))
                        joined.Add(new Dictionary<string, string>(rightData[j]));
                }
            }

            result = joined;
        }

        if (result.Count == 0) result = leftData;

        return Ok(new JoinResponse
        {
            Columns = allColumns.ToList(),
            Rows = result.Take(100).ToList()
        });
    }

    [HttpGet("join/common-columns")]
    public IActionResult GetCommonColumns([FromQuery] string sourceIds)
    {
        var ids = sourceIds.Split(',').ToList();
        if (ids.Count < 2) return BadRequest();

        var columnSets = ids.Select(id =>
        {
            var data = _mockData.GetData(id);
            if (data == null || data.Count == 0) return new HashSet<string>();
            return new HashSet<string>(data[0].Keys);
        }).ToList();

        var common = columnSets[0];
        for (int i = 1; i < columnSets.Count; i++)
            common.IntersectWith(columnSets[i]);

        return Ok(common.OrderBy(c => c).ToList());
    }

    [HttpPost("export")]
    public IActionResult ExportExcel([FromBody] DataRequest request)
    {
        var allData = _mockData.GetData(request.SourceId);
        if (allData == null) return NotFound();

        var filtered = allData;
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            filtered = filtered.Where(row =>
                row.Values.Any(v => v.ToLower().Contains(search))).ToList();
        }
        if (request.ColumnFilters != null)
        {
            foreach (var cf in request.ColumnFilters)
            {
                if (string.IsNullOrWhiteSpace(cf.Value)) continue;
                filtered = filtered.Where(row =>
                    row.ContainsKey(cf.Key) && row[cf.Key].ToLower().Contains(cf.Value.ToLower())).ToList();
            }
        }

        var columns = filtered.Count > 0 ? filtered[0].Keys.ToList() : new List<string>();
        var bytes = _excelExport.Export(filtered, columns, request.SourceId);

        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"{request.SourceId}_export.xlsx");
    }

    [HttpGet("translate/{lang}")]
    public IActionResult GetTranslations(string lang)
    {
        return Ok(_translation.GetAll(lang));
    }
}
