using ClosedXML.Excel;

namespace DashboardSMPPI.Services;

public class ExcelExportService
{
    public byte[] Export(List<Dictionary<string, string>> data, List<string> columns, string sheetName = "Data")
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(sheetName);

        // Headers
        for (int i = 0; i < columns.Count; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = columns[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1e3a5f");
            cell.Style.Font.FontColor = XLColor.White;
        }

        // Data rows
        for (int row = 0; row < data.Count; row++)
        {
            for (int col = 0; col < columns.Count; col++)
            {
                var value = data[row].GetValueOrDefault(columns[col], "");
                worksheet.Cell(row + 2, col + 1).Value = value;
            }
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents(1, 50);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
