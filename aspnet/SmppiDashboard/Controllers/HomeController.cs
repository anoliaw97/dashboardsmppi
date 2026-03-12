using Microsoft.AspNetCore.Mvc;
using SmppiDashboard.Models;
using SmppiDashboard.Services;

namespace SmppiDashboard.Controllers;

public class HomeController : Controller
{
    private readonly IDatabaseService _db;
    private readonly ILogger<HomeController> _logger;

    public HomeController(IDatabaseService db, ILogger<HomeController> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Main dashboard page – loads all data source metadata and saved joins from session.
    /// </summary>
    public async Task<IActionResult> Index([FromQuery] string lang = "en")
    {
        HttpContext.Session.SetString("Lang", lang);

        var sources = await _db.GetDataSourcesAsync(lang);

        var savedJoins = HttpContext.Session.GetObjectFromJson<List<SavedJoin>>("SavedJoins")
            ?? new List<SavedJoin>();

        var vm = new DashboardViewModel
        {
            DataSources = sources,
            Lang = lang,
            SavedJoins = savedJoins
        };

        return View(vm);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error() => View();
}
