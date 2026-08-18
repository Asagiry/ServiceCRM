using Microsoft.EntityFrameworkCore;
using ServiceCRM.Class;
namespace ServiceCRM
{
    public class AppDbContext : DbContext
    {
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Master> Masters => Set<Master>();
        public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
        public DbSet<Payment> Payments => Set<Payment>();

        public AppDbContext(DbContextOptions<AppDbContext> options): base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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
                .Property(r => r.TotalPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ServiceRequest>()
                .Property(r => r.DirectExpenses)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Master>()
                .Property(m => m.CommissionPercent)
                .HasPrecision(5, 2);
        }
    }
}
