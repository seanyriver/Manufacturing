using Manufacturing.Models;
using Manufacturing.Models.People;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Manufacturing.Models
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public DbSet<Material> Material { get; set; }
        //public DbSet<Tag> Tag { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Material>().HasIndex(p => new { p.Archived, p.Id });
            modelBuilder.Entity<Material>().HasIndex(p => new { p.Archived, p.Name });
        }
    }
}
