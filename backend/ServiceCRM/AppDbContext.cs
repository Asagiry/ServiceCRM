using Microsoft.EntityFrameworkCore;
using ServiceCRM.Models;
using ServiceCRM.Models.Auth;
using ServiceCRM.Models.Lead;
using ServiceCRM.Models.Request;
namespace ServiceCRM
{
    public class AppDbContext : DbContext
    {
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Master> Masters => Set<Master>();
        public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<LeadSource> LeadSources => Set<LeadSource>();
        public DbSet<AdExpense> AdExpenses => Set<AdExpense>();
        public DbSet<User> Users => Set<User>();


        public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            SetServiceRequestDb(modelBuilder);

            SetPaymentDb(modelBuilder);

            SetMasterDb(modelBuilder);

            SetLeadSourceDb(modelBuilder);

            SetUserDb(modelBuilder);
        }

        public void SetServiceRequestDb(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ServiceRequest>()
               .HasOne(m => m.Master)
               .WithMany(r => r.Requests)
               .HasForeignKey(m => m.MasterId)
               .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ServiceRequest>()
                .HasOne(r => r.Client)
                .WithMany(c => c.Requests)
                .HasForeignKey(r => r.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceRequest>()
                .HasOne(r => r.LeadSource)
                .WithMany()
                .HasForeignKey(r => r.LeadSourceId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ServiceRequest>()
                .Property(r => r.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceRequest>()
                .Property(r => r.DirectExpenses)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceRequest>()
                .Property(r => r.MasterPayout)
                .HasPrecision(18, 2);
        }

        public void SetPaymentDb(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);
        }

        public void SetMasterDb(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Master>()
                .Property(m => m.CommissionPercent)
                .HasPrecision(5, 2);
        }
        
        public void SetLeadSourceDb(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<LeadSource>()
                .Property(s => s.TargetWeeklyBudget)
                .HasPrecision(18, 2);

            modelBuilder.Entity<AdExpense>()
                .Property(a => a.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<AdExpense>()
                .HasOne(x => x.LeadSource)
                .WithMany(x => x.AdExpenses)
                .HasForeignKey(x => x.LeadSourceId)
                .OnDelete(DeleteBehavior.Cascade);

        }

        public void SetUserDb(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
        }
    }
}
