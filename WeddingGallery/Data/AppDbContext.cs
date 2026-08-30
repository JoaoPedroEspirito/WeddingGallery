using Microsoft.EntityFrameworkCore;
using WeddingGallery.Api.Models;

namespace WeddingGallery.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Event> Events { get; set; }
        public DbSet<Photo> Photos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            
            modelBuilder.Entity<Event>()
                .HasIndex(e => e.AccessCode)
                .IsUnique();

            modelBuilder.Entity<Photo>()
                .HasOne(p => p.Event)
                .WithMany(e => e.Photos)
                .HasForeignKey(p => p.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}