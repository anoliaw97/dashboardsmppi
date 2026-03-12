using ClosedXML.Excel;
using SmppiDashboard.Models;

namespace SmppiDashboard.Services;

public interface IExcelExportService
{
    byte[] ExportToExcel(
        List<Dictionary<string, object?>> rows,
        List<ColumnInfo> columns,
        string sheetName);
}

public class ExcelExportService : IExcelExportService
{
    public byte[] ExportToExcel(
        List<Dictionary<string, object?>> rows,
        List<ColumnInfo> columns,
        string sheetName)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(sheetName[..Math.Min(sheetName.Length, 31)]);

        // Header row
        for (int c = 0; c < columns.Count; c++)
        {
            var cell = worksheet.Cell(1, c + 1);
            cell.Value = columns[c].Label;
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e40af");
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        // Data rows
        for (int r = 0; r < rows.Count; r++)
        {
            var row = rows[r];
            for (int c = 0; c < columns.Count; c++)
            {
                var key = columns[c].Key;
                var value = row.GetValueOrDefault(key);
                var cell = worksheet.Cell(r + 2, c + 1);

                if (value is decimal d)
                    cell.Value = d;
                else if (value is DateTime dt)
                    cell.Value = dt;
                else
                    cell.Value = value?.ToString() ?? "";

                // Alternate row shading
                if (r % 2 == 1)
                    cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#f8fafc");
            }
        }

        // Auto-fit columns
        worksheet.ColumnsUsed().AdjustToContents();

        // Freeze header row
        worksheet.SheetView.FreezeRows(1);

        // Add auto-filter
        if (rows.Count > 0)
        {
            var dataRange = worksheet.RangeUsed();
            if (dataRange != null)
                dataRange.SetAutoFilter();
        }

        // Footer with export info
        worksheet.Cell(rows.Count + 3, 1).Value =
            $"Exported: {DateTime.Now:yyyy-MM-dd HH:mm:ss} | SMPPI Dashboard";
        worksheet.Cell(rows.Count + 3, 1).Style.Font.Italic = true;
        worksheet.Cell(rows.Count + 3, 1).Style.Font.FontColor = XLColor.Gray;

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }
}
