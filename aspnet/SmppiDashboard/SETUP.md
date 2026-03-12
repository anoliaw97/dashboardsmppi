# SMPPI Dashboard — ASP.NET Core Setup Guide

## Overview

This is the production-ready ASP.NET Core 8 (MVC) version of the SMPPI Dashboard.
It connects directly to SQL Server (SSMS-compatible) via Entity Framework Core.

## Stack

| Layer        | Technology                        |
|-------------|-----------------------------------|
| Framework   | ASP.NET Core 8 MVC                |
| Database    | SQL Server (any version ≥ 2016)   |
| ORM         | Entity Framework Core 8            |
| Export      | ClosedXML (Excel .xlsx)           |
| Frontend    | Vanilla JS + Chart.js (CDN)       |
| Styling     | Custom CSS (Tailwind-inspired)    |
| Session     | In-Memory (upgrade to Redis/SQL for production) |

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- SQL Server 2016+ (or SQL Server Express / Azure SQL)
- SQL Server Management Studio (SSMS) — optional but recommended

## 1. Database Setup

Run the following SQL in SSMS to create the SMPPI database and tables:

```sql
CREATE DATABASE SMPPI_DB;
GO

USE SMPPI_DB;
GO

CREATE TABLE dbo.Pensyarah (
    Id           INT IDENTITY(1,1) PRIMARY KEY,
    NoStaf       NVARCHAR(20)  NOT NULL UNIQUE,
    Nama         NVARCHAR(150) NOT NULL,
    Jawatan      NVARCHAR(100),
    Ptj          NVARCHAR(100),
    GredJawatan  NVARCHAR(20),
    Status       NVARCHAR(10),
    Email        NVARCHAR(200),
    NoTelefon    NVARCHAR(20)
);

CREATE TABLE dbo.Pascasiswazah (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    NoMatrik        NVARCHAR(20)  NOT NULL UNIQUE,
    Nama            NVARCHAR(150) NOT NULL,
    Program         NVARCHAR(100),
    Mod             NVARCHAR(10),
    Sesi            NVARCHAR(20),
    StatusPengajian NVARCHAR(10),
    NoPenyelia      NVARCHAR(20)
);

CREATE TABLE dbo.Penyelidikan (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    KodProjek           NVARCHAR(30)  NOT NULL UNIQUE,
    TajukProjek         NVARCHAR(300) NOT NULL,
    NoPenyelidikUtama   NVARCHAR(20),
    SumberTunai         NVARCHAR(100),
    JumlahGeran         DECIMAL(15,2),
    StatusProjek        NVARCHAR(10),
    TarikhMula          DATE,
    TarikhTamat         DATE
);

CREATE TABLE dbo.HartaIntelek (
    Id                 INT IDENTITY(1,1) PRIMARY KEY,
    NoHartaIntelek     NVARCHAR(30)  NOT NULL UNIQUE,
    Tajuk              NVARCHAR(300) NOT NULL,
    NoPemohon          NVARCHAR(20),
    JenisHartaIntelek  NVARCHAR(30),
    NoPendaftaran      NVARCHAR(50),
    StatusPermohonan   NVARCHAR(15),
    TarikhFail         DATE,
    TarikhGranted      DATE
);

CREATE TABLE dbo.Penyeliaan (
    Id               INT IDENTITY(1,1) PRIMARY KEY,
    NoPenyelia       NVARCHAR(20) NOT NULL,
    NoMatrik         NVARCHAR(20) NOT NULL,
    PerananPenyelia  NVARCHAR(15),
    Sesi             NVARCHAR(20),
    StatusPenyeliaan NVARCHAR(15)
);
GO
```

## 2. Configuration

Update `appsettings.json` with your SQL Server connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=SMPPI_DB;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

Examples:
- Local named instance: `Server=.\SQLEXPRESS;Database=SMPPI_DB;Trusted_Connection=True;TrustServerCertificate=True`
- SQL Auth: `Server=myserver;Database=SMPPI_DB;User Id=sa;Password=yourpassword;TrustServerCertificate=True`
- Azure SQL: `Server=tcp:myserver.database.windows.net,1433;Database=SMPPI_DB;Authentication=Active Directory Default`

## 3. Run Locally

```bash
cd aspnet/SmppiDashboard
dotnet restore
dotnet run
```

Open: `https://localhost:5001` or `http://localhost:5000`

## 4. Publish to IIS / Azure

```bash
dotnet publish -c Release -o ./publish
```

Then copy the `publish` folder to your IIS site root or deploy to Azure App Service.

### IIS Configuration
1. Install the [.NET 8 Hosting Bundle](https://dotnet.microsoft.com/download/dotnet/8.0)
2. Create a new IIS site pointing to the `publish` folder
3. Set Application Pool to **No Managed Code**
4. Ensure the app pool identity has read access to the publish folder

## 5. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/data/sources?lang=en` | All data source metadata |
| POST   | `/api/data/query` | Paginated, filtered, sorted data |
| POST   | `/api/data/ai-query` | Generate SQL from natural language |
| GET    | `/api/data/sample-queries` | Example AI prompts |
| POST   | `/api/data/explain` | Explain a cell value |
| POST   | `/api/data/export` | Export to Excel |
| POST   | `/api/join/preview` | Preview multi-table join |
| POST   | `/api/join/save` | Save a join definition |
| GET    | `/api/join/list` | List saved joins |
| POST   | `/api/join/load/{id}` | Re-execute a saved join |
| DELETE | `/api/join/{id}` | Delete a saved join |
| POST   | `/api/join/export` | Export join result to Excel |
| GET    | `/api/join/common-columns` | Find common join columns |

## 6. Replacing AI with a Real LLM

The `AiQueryService.cs` uses regex-based NL-to-SQL for demo purposes.
To use Azure OpenAI or another LLM:

1. Add the OpenAI NuGet package:
   ```bash
   dotnet add package Azure.AI.OpenAI
   ```

2. Inject `OpenAIClient` in `Program.cs`:
   ```csharp
   builder.Services.AddSingleton(new OpenAIClient(
       new Uri(builder.Configuration["AzureOpenAI:Endpoint"]),
       new AzureKeyCredential(builder.Configuration["AzureOpenAI:Key"])));
   ```

3. Replace `GenerateSql()` in `AiQueryService.cs` with an actual API call.

## 7. Production Recommendations

- **Session**: Replace `AddDistributedMemoryCache()` with SQL Server or Redis session store
- **Authentication**: Add ASP.NET Core Identity or Azure AD / Single Sign-On
- **Saved Joins**: Store in the database instead of session for persistence
- **Rate Limiting**: Add `Microsoft.AspNetCore.RateLimiting` for API endpoints
- **Logging**: Configure Serilog or Application Insights for structured logs
- **HTTPS**: Enforce HTTPS in production, obtain a valid TLS certificate
