using Microsoft.EntityFrameworkCore;
using SmppiDashboard.Models;

namespace SmppiDashboard.Data;

public class SmppiDbContext : DbContext
{
    public SmppiDbContext(DbContextOptions<SmppiDbContext> options) : base(options) { }

    public DbSet<Pensyarah> Pensyarah { get; set; }
    public DbSet<Pascasiswazah> Pascasiswazah { get; set; }
    public DbSet<Penyelidikan> Penyelidikan { get; set; }
    public DbSet<HartaIntelek> HartaIntelek { get; set; }
    public DbSet<Penyeliaan> Penyeliaan { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure indexes for common search/filter columns
        modelBuilder.Entity<Pensyarah>()
            .HasIndex(p => p.NoStaf).IsUnique();
        modelBuilder.Entity<Pensyarah>()
            .HasIndex(p => p.Ptj);
        modelBuilder.Entity<Pensyarah>()
            .HasIndex(p => p.Status);

        modelBuilder.Entity<Pascasiswazah>()
            .HasIndex(p => p.NoMatrik).IsUnique();
        modelBuilder.Entity<Pascasiswazah>()
            .HasIndex(p => p.NoPenyelia);
        modelBuilder.Entity<Pascasiswazah>()
            .HasIndex(p => p.StatusPengajian);

        modelBuilder.Entity<Penyelidikan>()
            .HasIndex(p => p.KodProjek).IsUnique();
        modelBuilder.Entity<Penyelidikan>()
            .HasIndex(p => p.NoPenyelidikUtama);
        modelBuilder.Entity<Penyelidikan>()
            .HasIndex(p => p.StatusProjek);

        modelBuilder.Entity<HartaIntelek>()
            .HasIndex(h => h.NoHartaIntelek).IsUnique();
        modelBuilder.Entity<HartaIntelek>()
            .HasIndex(h => h.NoPemohon);

        modelBuilder.Entity<Penyeliaan>()
            .HasIndex(p => new { p.NoPenyelia, p.NoMatrik, p.Sesi });
    }
}
