using DashboardSMPPI.Models;
using DashboardSMPPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace DashboardSMPPI.Controllers;

public class HomeController : Controller
{
    private readonly TranslationService _translation;
    private readonly MockDataService _mockData;

    public HomeController(TranslationService translation, MockDataService mockData)
    {
        _translation = translation;
        _mockData = mockData;
    }

    public IActionResult Index(string lang = "en")
    {
        var vm = new DashboardViewModel
        {
            DataSources = DataSourceDefinitions.GetAll(),
            Lang = lang
        };
        ViewBag.Translations = _translation.GetAll(lang);
        ViewBag.Lang = lang;
        return View(vm);
    }
}
