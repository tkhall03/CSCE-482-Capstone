using Capstone.Models;
using Microsoft.EntityFrameworkCore;

namespace Capstone.Data
{
    public class SeaAggieCorpContext : DbContext
    {
        public DbSet<Class> Classes { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Term> Terms { get; set; }


        public SeaAggieCorpContext(DbContextOptions<SeaAggieCorpContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Person>()
                .HasMany(p => p.Classes)
                .WithMany(c => c.Persons)
                .UsingEntity(j => j.ToTable("PersonClass"));

        }

    }
}
