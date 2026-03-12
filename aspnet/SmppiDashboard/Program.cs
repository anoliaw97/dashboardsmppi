using Microsoft.EntityFrameworkCore;
using SmppiDashboard.Data;
using SmppiDashboard.Services;

var builder = WebApplication.CreateBuilder(args);

// Add MVC with views
builder.Services.AddControllersWithViews()
    .AddNewtonsoftJson();

// SQL Server via Entity Framework Core (SSMS connection)
builder.Services.AddDbContext<SmppiDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Application services
builder.Services.AddScoped<IDatabaseService, DatabaseService>();
builder.Services.AddScoped<IAiQueryService, AiQueryService>();
builder.Services.AddScoped<IExcelExportService, ExcelExportService>();

// Session for saved joins
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(2);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseSession();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
